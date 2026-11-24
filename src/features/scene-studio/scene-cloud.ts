"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPublicSupabaseEnvironment } from "@/lib/env/public";
import type { SceneDocument } from "./scene-document";
import { parseSceneDocument } from "./scene-document";

type CloudRow = {
  id: string;
  title: string;
  document: { camera: string; objects: unknown };
  revision: number;
  updated_at: string;
};

export type SceneCloudSession =
  | { status: "unconfigured" }
  | { status: "signed-out" }
  | { status: "ready"; userId: string };

let client: ReturnType<typeof createSupabaseBrowserClient> | null = null;

function getClient() {
  if (!getPublicSupabaseEnvironment().configured) return null;
  client ??= createSupabaseBrowserClient();
  return client;
}

function fromCloudRow(row: CloudRow): SceneDocument {
  const parsed = parseSceneDocument({
    format: "forma-scene",
    version: 1,
    name: row.title,
    camera: row.document.camera,
    objects: row.document.objects,
  });
  return {
    id: row.id,
    name: parsed.name,
    camera: parsed.camera,
    objects: parsed.objects,
    updatedAt: row.updated_at,
    revision: row.revision,
  };
}

export async function getSceneCloudSession(): Promise<SceneCloudSession> {
  const supabase = getClient();
  if (!supabase) return { status: "unconfigured" };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { status: "signed-out" };
  return { status: "ready", userId: data.user.id };
}

export async function loadCloudCompositions(): Promise<SceneDocument[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return [];
  const { data, error } = await supabase
    .from("scene_studio_compositions")
    .select("id,title,document,revision,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as CloudRow[]).map(fromCloudRow);
}

export async function saveCloudComposition(
  composition: SceneDocument,
): Promise<SceneDocument> {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("Sign in to sync compositions across devices.");

  const { data, error } = await supabase.rpc("save_scene_studio_composition", {
    p_id: composition.id,
    p_title: composition.name.trim().slice(0, 80) || "Untitled composition",
    p_document: { camera: composition.camera, objects: composition.objects },
    p_expected_revision: composition.revision ?? null,
  });
  if (error) throw error;
  if (!data || typeof data !== "object") throw new Error("The cloud did not confirm the scene save.");
  const row = data as CloudRow;
  return fromCloudRow(row);
}

export async function deleteCloudComposition(id: string): Promise<void> {
  const supabase = getClient();
  if (!supabase) return;
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return;
  const { error } = await supabase
    .from("scene_studio_compositions")
    .delete()
    .eq("id", id)
    .eq("owner_id", authData.user.id);
  if (error) throw error;
}

export async function signOutCloudSession(): Promise<void> {
  const supabase = getClient();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

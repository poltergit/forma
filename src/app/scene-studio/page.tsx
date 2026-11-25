import type { Metadata } from "next";
import { SceneStudio } from "@/features/scene-studio/components/scene-studio";

export const metadata: Metadata = {
  title: "The Workbench",
  description: "A spatial workbench for composing forms, materials, light, and digital scenes."
};

export default function SceneStudioPage() {
  return <SceneStudio />;
}

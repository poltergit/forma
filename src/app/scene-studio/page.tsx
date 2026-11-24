import type { Metadata } from "next";
import { SceneStudio } from "@/features/scene-studio/components/scene-studio";

export const metadata: Metadata = {
  title: "Scene Studio",
  description: "A spatial instrument for composing forms, materials, and digital scenes.",
};

export default function SceneStudioPage() {
  return <SceneStudio />;
}

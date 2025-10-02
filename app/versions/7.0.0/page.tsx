import ReactVideoEditor from "@/components/editor/version-7.0.0/react-video-editor";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Version7() {
  /**
   * A project ID represents a unique editing session or workspace for a user.
   *
   * Each project ID:
   * - Acts as a container for a specific editing session
   * - Can store multiple overlays, templates, and editing configurations
   * - Allows users to maintain separate workspaces for different videos/projects
   * - Persists the editing state across browser sessions
   *
   * Users can have multiple project IDs, enabling them to:
   * - Work on different videos simultaneously
   * - Maintain separate template collections
   * - Switch between different editing contexts
   *
   * Example use cases:
   * - A user creating different video styles for various social media platforms
   * - Managing separate projects for personal and professional content
   * - Creating template collections for different types of videos
   */
  const PROJECT_ID = "DEFAULT_RVE_PROJECT";

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      {" "}
      <ReactVideoEditor projectId={PROJECT_ID} />
    </SidebarProvider>
  );
}

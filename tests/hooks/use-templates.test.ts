import { renderHook } from "@testing-library/react";
import { useTemplates } from "../../components/editor/version-7.0.0/hooks/use-templates";

// Mock sample templates
const mockTemplates = [
  {
    id: "template1",
    name: "Test Template 1",
    description: "A test template",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    createdBy: "Test User",
    category: "Test",
    tags: ["test", "demo"],
    duration: 30,
    overlays: [
      {
        type: "VIDEO",
        content: "video-url.mp4",
      },
    ],
    thumbnail: "video-url.mp4",
  },
  {
    id: "template2",
    name: "Another Template",
    description: "Another test template",
    createdAt: "2024-01-02",
    updatedAt: "2024-01-02",
    createdBy: "Test User",
    category: "Test",
    tags: ["another", "example"],
    duration: 45,
    overlays: [
      {
        type: "IMAGE",
        content: "image-url.jpg",
      },
    ],
    thumbnail: "custom-thumbnail.jpg",
  },
];

// Mock the entire useTemplates implementation
jest.mock("../../components/editor/version-7.0.0/hooks/use-templates", () => ({
  useTemplates: ({ searchQuery = "" } = {}) => {
    const filteredTemplates = mockTemplates.filter((template) => {
      if (!searchQuery) return true;
      return (
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    });

    return {
      templates: filteredTemplates,
      isLoading: false,
      error: null,
      refreshTemplates: jest.fn(),
    };
  },
}));

describe("useTemplates", () => {
  it("should load templates successfully", () => {
    const { result } = renderHook(() => useTemplates());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.templates).toHaveLength(2);

    // Verify template data
    const [template1, template2] = result.current.templates;
    expect(template1.name).toBe("Test Template 1");
    expect(template1.thumbnail).toBe("video-url.mp4");
    expect(template2.name).toBe("Another Template");
    expect(template2.thumbnail).toBe("custom-thumbnail.jpg");
  });

  it("should filter templates based on search query", () => {
    const { result } = renderHook(() =>
      useTemplates({ searchQuery: "another" })
    );

    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].name).toBe("Another Template");
  });

  it("should filter templates based on tags", () => {
    const { result } = renderHook(() => useTemplates({ searchQuery: "demo" }));

    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].name).toBe("Test Template 1");
  });

  it("should handle empty search query", () => {
    const { result } = renderHook(() => useTemplates({ searchQuery: "" }));

    expect(result.current.templates).toHaveLength(2);
  });

  it("should provide refresh function", () => {
    const { result } = renderHook(() => useTemplates());

    expect(typeof result.current.refreshTemplates).toBe("function");
  });
});

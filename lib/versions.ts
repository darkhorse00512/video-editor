import fs from "fs";
import path from "path";
import matter from "gray-matter";

const versionsDirectory = path.join(process.cwd(), "versions");

export function getSortedVersionsData() {
  const fileNames = fs.readdirSync(versionsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(versionsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    return {
      slug,
      ...(data as {
        date: string;
        title: string;
        description?: string;
        version: string;
        changes: string[];
        image?: string;
        video?: string;
        founderNotes?: string;
        status?: string;
        branch?: string;
      }),
    };
  });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostData(slug: string): Promise<{
  date: string;
  title: string;
  slug: string;
  content: string; // Change this from contentHtml to content
  description?: string;
  imageUrl?: string;
  authorName?: string;
  authorTitle?: string;
}> {
  const fullPath = path.join(versionsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    content, // Return the raw markdown content
    ...(data as {
      date: string;
      title: string;
      description?: string;
      imageUrl?: string;
      authorName?: string;
      authorTitle?: string;
    }),
  };
}

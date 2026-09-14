import { prisma, isDatabaseReady } from "../prisma";
import { memoryDb } from "../memory-db";
import type { ContentProject } from "../db";

function parseJson(str: any) {
  if (!str) return undefined;
  if (typeof str !== "string") return str;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

function stringifyJson(val: any) {
  if (val === undefined || val === null) return null;
  return typeof val === "string" ? val : JSON.stringify(val);
}

function toDomain(raw: any): ContentProject {
  return {
    id: raw.id,
    productId: raw.productId,
    platform: raw.platform,
    duration: raw.duration,
    style: raw.style,
    objective: raw.objective,
    targetAudience: raw.targetAudience,
    hooks: parseJson(raw.hooks),
    angles: parseJson(raw.angles),
    concepts: parseJson(raw.concepts),
    bestConcept: parseJson(raw.bestConcept),
    storyboard: parseJson(raw.storyboard),
    videoPrompt: parseJson(raw.videoPrompt),
    status: raw.status,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw.createdAt),
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : String(raw.updatedAt),
  };
}

export const ContentRepository = {
  async findAll(): Promise<ContentProject[]> {
    if (!isDatabaseReady) {
      return [...memoryDb.contentProjects];
    }
    try {
      const projects = await prisma.contentProject.findMany({
        orderBy: { createdAt: "desc" },
      });
      return projects.map(toDomain);
    } catch {
      return [...memoryDb.contentProjects];
    }
  },

  async findById(id: string): Promise<ContentProject | null> {
    if (!isDatabaseReady) {
      return memoryDb.contentProjects.find((c) => c.id === id) || null;
    }
    try {
      const project = await prisma.contentProject.findUnique({
        where: { id },
      });
      return project ? toDomain(project) : (memoryDb.contentProjects.find((c) => c.id === id) || null);
    } catch {
      return memoryDb.contentProjects.find((c) => c.id === id) || null;
    }
  },

  async findByProductId(productId: string): Promise<ContentProject[]> {
    if (!isDatabaseReady) {
      return memoryDb.contentProjects.filter((c) => c.productId === productId);
    }
    try {
      const projects = await prisma.contentProject.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
      });
      return projects.map(toDomain);
    } catch {
      return memoryDb.contentProjects.filter((c) => c.productId === productId);
    }
  },

  async create(data: Omit<ContentProject, "createdAt" | "updatedAt"> & { id?: string }): Promise<ContentProject> {
    if (!isDatabaseReady) {
      const newProject: ContentProject = {
        id: data.id || `content_${Date.now()}`,
        productId: data.productId,
        platform: data.platform,
        duration: data.duration,
        style: data.style,
        objective: data.objective,
        targetAudience: data.targetAudience,
        hooks: data.hooks,
        angles: data.angles,
        concepts: data.concepts,
        bestConcept: data.bestConcept,
        storyboard: data.storyboard,
        videoPrompt: data.videoPrompt,
        status: data.status || "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryDb.contentProjects.unshift(newProject);
      return newProject;
    }
    try {
      const created = await prisma.contentProject.create({
        data: {
          id: data.id,
          productId: data.productId,
          platform: data.platform,
          duration: data.duration,
          style: data.style,
          objective: data.objective,
          targetAudience: data.targetAudience,
          hooks: stringifyJson(data.hooks),
          angles: stringifyJson(data.angles),
          concepts: stringifyJson(data.concepts),
          bestConcept: stringifyJson(data.bestConcept),
          storyboard: stringifyJson(data.storyboard),
          videoPrompt: stringifyJson(data.videoPrompt),
          status: data.status || "draft",
        },
      });
      return toDomain(created);
    } catch {
      const fallbackProject: ContentProject = {
        ...data,
        id: data.id || `content_${Date.now()}`,
        status: data.status || "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryDb.contentProjects.unshift(fallbackProject);
      return fallbackProject;
    }
  },

  async update(id: string, data: Partial<ContentProject>): Promise<ContentProject | null> {
    if (!isDatabaseReady) {
      const idx = memoryDb.contentProjects.findIndex((c) => c.id === id);
      if (idx !== -1) {
        memoryDb.contentProjects[idx] = { ...memoryDb.contentProjects[idx], ...data, updatedAt: new Date().toISOString() };
        return memoryDb.contentProjects[idx];
      }
      return null;
    }
    try {
      const updateData: any = {};
      if (data.platform !== undefined) updateData.platform = data.platform;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.style !== undefined) updateData.style = data.style;
      if (data.objective !== undefined) updateData.objective = data.objective;
      if (data.targetAudience !== undefined) updateData.targetAudience = data.targetAudience;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.hooks !== undefined) updateData.hooks = stringifyJson(data.hooks);
      if (data.angles !== undefined) updateData.angles = stringifyJson(data.angles);
      if (data.concepts !== undefined) updateData.concepts = stringifyJson(data.concepts);
      if (data.bestConcept !== undefined) updateData.bestConcept = stringifyJson(data.bestConcept);
      if (data.storyboard !== undefined) updateData.storyboard = stringifyJson(data.storyboard);
      if (data.videoPrompt !== undefined) updateData.videoPrompt = stringifyJson(data.videoPrompt);

      const updated = await prisma.contentProject.update({
        where: { id },
        data: updateData,
      });
      return toDomain(updated);
    } catch {
      const idx = memoryDb.contentProjects.findIndex((c) => c.id === id);
      if (idx !== -1) {
        memoryDb.contentProjects[idx] = { ...memoryDb.contentProjects[idx], ...data, updatedAt: new Date().toISOString() };
        return memoryDb.contentProjects[idx];
      }
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isDatabaseReady) {
      memoryDb.contentProjects = memoryDb.contentProjects.filter((c) => c.id !== id);
      return true;
    }
    try {
      await prisma.contentProject.delete({
        where: { id },
      });
      return true;
    } catch {
      memoryDb.contentProjects = memoryDb.contentProjects.filter((c) => c.id !== id);
      return true;
    }
  },
};

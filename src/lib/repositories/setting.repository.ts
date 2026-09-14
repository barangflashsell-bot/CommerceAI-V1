import { prisma } from "../prisma";
import type { Setting } from "../db";

function toDomain(raw: any): Setting {
  return {
    id: raw.id,
    key: raw.key,
    value: raw.value,
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : String(raw.updatedAt),
  };
}

export const SettingRepository = {
  async findAll(): Promise<Setting[]> {
    const settings = await prisma.setting.findMany();
    return settings.map(toDomain);
  },

  async get(key: string): Promise<Setting | null> {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });
    return setting ? toDomain(setting) : null;
  },

  async set(key: string, value: string): Promise<Setting> {
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return toDomain(setting);
  },
};

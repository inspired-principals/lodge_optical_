export async function loadModule(name: string) {
  try {
    const module = await import(`../modules/${name}/index.ts`);
    return module;
  } catch (error) {
    console.error("Module load failed:", name, error);
    return null;
  }
}

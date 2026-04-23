function buildHunkLines(before: string, after: string) {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const maxLines = Math.max(beforeLines.length, afterLines.length);
  const diffLines: string[] = [];

  for (let index = 0; index < maxLines; index += 1) {
    const beforeLine = beforeLines[index];
    const afterLine = afterLines[index];

    if (beforeLine === afterLine) {
      if (beforeLine !== undefined) {
        diffLines.push(` ${beforeLine}`);
      }
      continue;
    }

    if (beforeLine !== undefined) {
      diffLines.push(`-${beforeLine}`);
    }

    if (afterLine !== undefined) {
      diffLines.push(`+${afterLine}`);
    }
  }

  return diffLines;
}

export function generateDiff(before: string, after: string, targetPath: string) {
  const diffLines = buildHunkLines(before, after);

  return [
    `--- a/${targetPath}`,
    `+++ b/${targetPath}`,
    `@@ -1,${before.split("\n").length} +1,${after.split("\n").length} @@`,
    ...diffLines,
  ].join("\n");
}

import { glob, appendFile } from "node:fs/promises";
import { join, sep } from "node:path";
import { camelCase } from "scule";

function writeNestedServices(services: Record<string, unknown>): string {
  return Object.entries(services)
    .map(([k, v]) => {
      if (typeof v === "string") {
        return `${k}: new ${v}()`;
      } else {
        return `${k}: {
          ${writeNestedServices(v as any)}
        }`;
      }
    })
    .join(", \n");
}

export async function buildServicesList(nuxtRoot: string, filePath: string) {
  const servicesRoot = join(nuxtRoot, "server", "lib", "services");
  const servicesGlob = glob(join(servicesRoot, "**", "*.ts"));

  const servicesFiles: Array<string> = await Array.fromAsync(servicesGlob);

  const imports: Array<{ name: string; path: string }> = [];
  const services: Record<string, unknown> = {};

  for (const file of servicesFiles) {
    let name = file.replace(servicesRoot, "").slice(1);

    const serviceName = name.slice(0, name.length - 3).replaceAll(sep, "_");
    imports.push({
      name: serviceName,
      path: file.slice(0, file.length - 3),
    });

    if (name.includes("/")) {
      const groups = name.split("/");
      const realServiceName = groups.at(-1)!.replace(".ts", "");

      const innerGroups = groups.slice(0, groups.length - 1);
      let currentGroup = services;

      for (const group of innerGroups) {
        if (!currentGroup[camelCase(group)]) {
          currentGroup[camelCase(group)] = {};
        }

        currentGroup = currentGroup[camelCase(group)] as Record<string, unknown>;
      }

      currentGroup[camelCase(realServiceName)] = serviceName;
    } else {
      services[camelCase(serviceName)] = serviceName;
    }
  }

  const importsAsString = imports
    .map((file) => `import { default as ${file.name} } from '${file.path}';`)
    .join("\n");

  const servicesAsString = writeNestedServices(services);

  await appendFile(
    filePath,
    `
      ${importsAsString}

      export const services = {
        ${servicesAsString}
      };
    `,
  );
}

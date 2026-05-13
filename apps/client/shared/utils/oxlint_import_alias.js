import { eslintCompatPlugin } from "@oxlint/plugins";

/** @type {import('@oxlint/plugins').Rule} */
const rule = {
  meta: {
    fixable: "code",
  },
  createOnce(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        // Vérifie si c'est un import relatif ou avec ~~/
        if (source.startsWith(".") || source.startsWith("~~/")) {
          // Vérifie si le chemin contient /shared/ ou /server/
          const matchShared = source.match(/\/shared\//i);
          const matchServer = source.match(/\/server\//i);

          if (matchShared || matchServer) {
            // Remplace le chemin par l'alias
            let newSource;
            if (matchShared) {
              const parts = source.split(/\/shared\//i);
              newSource = `#shared/${parts.slice(1).join("/")}`;
            } else if (matchServer) {
              const parts = source.split(/\/server\//i);
              newSource = `#server/${parts.slice(1).join("/")}`;
            }

            context.report({
              node,
              message: `Prefer alias import: "${newSource}" instead of "${source}"`,
              fix: (fixer) => fixer.replaceText(node.source, `"${newSource}"`),
            });
          }
        }
      },
    };
  },
};

export default eslintCompatPlugin({
  meta: {
    name: "nuxt-imports",
  },
  rules: {
    "import-alias": rule,
  },
});

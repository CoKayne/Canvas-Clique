var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => CreateCliquePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

var CreateCliquePlugin = class extends import_obsidian.Plugin {
  async onload() {
    // Register a hotkey to create cliques
    this.addCommand({
      id: "create-clique",
      name: "Create Clique from Selected Files",
      hotkeys: [
        {
          modifiers: ["Mod"],
          key: "G"
        }
      ],
      checkCallback: (checking) => {
        const activeLeaf = this.app.workspace.getActiveViewOfType(import_obsidian.ItemView);
        if (activeLeaf && activeLeaf.getViewType() === "canvas") {
          if (!checking) {
            this.createCliqueFromSelection(activeLeaf);
          }
          return true;
        }
        return false;
      }
    });

    // Register a hotkey to remove cliques
    this.addCommand({
      id: "remove-clique",
      name: "Remove Clique from Selected Files",
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: "G"
        }
      ],
      checkCallback: (checking) => {
        const activeLeaf = this.app.workspace.getActiveViewOfType(import_obsidian.ItemView);
        if (activeLeaf && activeLeaf.getViewType() === "canvas") {
          if (!checking) {
            this.removeCliqueFromSelection(activeLeaf);
          }
          return true;
        }
        return false;
      }
    });
  }

  async createCliqueFromSelection(activeLeaf) {
    const canvas = activeLeaf.canvas;
    if (!canvas) {
      new import_obsidian.Notice("No canvas is currently open.");
      return;
    }

    // Get selected nodes
    const selectedNodes = Array.from(canvas.nodes.values()).filter((node) => node.nodeEl.classList.contains("is-selected") && node.file);

    if (selectedNodes.length < 2) {
      new import_obsidian.Notice("Please select at least 2 files in the canvas.");
      return;
    }

    // Extract file paths from the selected nodes
    const files = selectedNodes.map((node) => node.file);

    // Create internal links for all combinations of files (clique)
    for (const fileA of files) {
      const contentA = await this.app.vault.read(fileA);
      const linksToAdd = files
        .filter((fileB) => fileB.path !== fileA.path) // Exclude self-links
        .map((fileB) => `[[${fileB.basename}]]`) // Generate links
        .join("\n");

      const updatedContent = `${contentA}\n\n${linksToAdd}`;

      await this.app.vault.modify(fileA, updatedContent);
    }

    new import_obsidian.Notice(`Clique created: ${files.length} files interconnected.`);
  }

  async removeCliqueFromSelection(activeLeaf) {
    const canvas = activeLeaf.canvas;
    if (!canvas) {
      new import_obsidian.Notice("No canvas is currently open.");
      return;
    }

    // Get selected nodes
    const selectedNodes = Array.from(canvas.nodes.values()).filter((node) => node.nodeEl.classList.contains("is-selected") && node.file);

    if (selectedNodes.length < 2) {
      new import_obsidian.Notice("Please select at least 2 files in the canvas.");
      return;
    }

    // Extract file paths from the selected nodes
    const files = selectedNodes.map((node) => node.file);

    // Remove internal links for all combinations of files (clique)
    for (const fileA of files) {
      let contentA = await this.app.vault.read(fileA);

      const linksToRemove = files
        .filter((fileB) => fileB.path !== fileA.path) // Exclude self-links
        .map((fileB) => `\\[\\[${fileB.basename}\\]\\]`); // Generate regex for links

      const regex = new RegExp(`\\n?(${linksToRemove.join("|")})`, "g");
      contentA = contentA.replace(regex, ""); // Remove links

      await this.app.vault.modify(fileA, contentA);
    }

    new import_obsidian.Notice(`Clique removed: Links between ${files.length} files deleted.`);
  }
};


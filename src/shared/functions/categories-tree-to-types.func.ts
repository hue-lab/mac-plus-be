import { Category } from "../../category/schema/category.schema";

export function categoriesTreeToTypes(categoryTree: Category): string[] {
  const typesList: Set<string> = new Set();
  processCategoryTreeNode(typesList, categoryTree);
  return Array.from(typesList);
}

function processCategoryTreeNode(typesList: Set<string>, categoryNode: Category): void {
  if (categoryNode.productTypeId) {
    typesList.add(categoryNode.productTypeId);
  }
  if (categoryNode.children && categoryNode.children.length) {
    categoryNode.children.forEach((item: Category) => {
      processCategoryTreeNode(typesList, item);
    });
  }
}

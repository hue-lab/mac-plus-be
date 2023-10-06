import { CategoryDocument } from "../../category/schema/category.schema";

export function nestedCategoriesList(category: CategoryDocument): string[] {
  const categoriesList: Set<string> = new Set();
  processCategoryTreeNode(categoriesList, category);
  return Array.from(categoriesList);
}

function processCategoryTreeNode(
  categoriesList: Set<string>,
  categoryNode: CategoryDocument,
): void {
  categoriesList.add(categoryNode._id.toString());
  if (categoryNode.children && categoryNode.children.length) {
    categoryNode.children.forEach((item: CategoryDocument) => {
      processCategoryTreeNode(categoriesList, item);
    });
  }
}
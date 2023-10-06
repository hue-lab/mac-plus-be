import { CategoryDocument } from "../../category/schema/category.schema";


export function addNestedCategoriesList(category: CategoryDocument): void {
  processCategoryTreeNode(category);
}

function processCategoryTreeNode(
  categoryNode: CategoryDocument,
): string[] {
  let categoriesList: string[] = [];
  categoriesList.push(categoryNode._id.toString());
  if (categoryNode.children && categoryNode.children.length) {
    categoryNode.children.forEach((item: CategoryDocument) => {
      categoriesList = categoriesList.concat(processCategoryTreeNode(item));
    });
  }
  categoryNode.categoryList = categoriesList;
  return categoriesList;
}
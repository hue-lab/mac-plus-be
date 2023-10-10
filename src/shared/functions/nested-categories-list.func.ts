import { CategoryDocument } from "../../category/schema/category.schema";
import { ObjectId } from "mongodb";

export function nestedCategoriesList(category: CategoryDocument): ObjectId[] {
  const categoriesList: ObjectId[] = [];
  processCategoryTreeNode(categoriesList, category);
  return Array.from(categoriesList);
}

function processCategoryTreeNode(
  categoriesList: ObjectId[],
  categoryNode: CategoryDocument,
): void {
  categoriesList.push(categoryNode._id);
  if (categoryNode.children && categoryNode.children.length) {
    categoryNode.children.forEach((item: CategoryDocument) => {
      processCategoryTreeNode(categoriesList, item);
    });
  }
}
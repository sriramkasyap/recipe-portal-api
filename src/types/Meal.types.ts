export type GroceryItem = {
  name?: string | null;
  quantity?: number | null;
  units?: string | null;
  checked: boolean;
};

export type GroceryList = {
  [key: string]: GroceryItem;
};

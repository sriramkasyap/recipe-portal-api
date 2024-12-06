export type GroceryItem = {
  name: string;
  quantity: number;
  units: string;
  checked: boolean;
};

export type GroceryList = {
  [key: string]: GroceryItem;
};

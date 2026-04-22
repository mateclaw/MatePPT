export interface GuideItem {
  id: number;
  title: string;
  description: string;
  category: 'check' | 'rule' | 'quantity';
}

export interface PageTypeRule {
  type: string;
  icon: string;
  description: string;
  annotations: string[];
}

export interface QuantityRule {
  label: string;
  count: number;
  highlight: boolean;
}

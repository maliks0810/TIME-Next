export interface IChartData {
  name: string;
  value: number;
  itemStyle: {
    color: string;
  }
}

// to be replaced by service call
export const setupStatusData : IChartData[] = [
    { 
      name: "New Security Requested",
      value: 20,
      itemStyle: { color: "#6c1444" }
    },
    {
      name: "New Security Request Complete",
      value: 20,
      itemStyle: { color: "#654d88" }
    },
    {
      name: "Security Setup Initialized",
      value: 20,
      itemStyle: { color: "#013d7d" }
    },
    { 
      name: "Security Pending Review",
      value: 20,
      itemStyle: { color: "#db9f00" }
    },
    { 
      name: "Security Setup Complete",
      value: 20,
      itemStyle: { color: "#4b773d" }
    },
  ]

  export const riskManagementStatusData : IChartData[] = [
    { 
      name: "In Progress",
      value: 33,
      itemStyle: { color: "#db9f00" }
    },
    { 
      name: "Complete",
      value: 34,
      itemStyle: { color: "#4b773d" }
    },
    { 
      name:"Pending",
      value: 33,
      itemStyle: { color: "#6c1444" }
    },
  ];
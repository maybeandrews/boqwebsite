export type Vendor = {
    id: string;
    name: string;
    tags: string[];
};

export const vendors: Vendor[] = [
    { id: "1", name: "ABC Construction", tags: ["Construction"] },
    { id: "2", name: "XYZ Electrical", tags: ["Electrical"] },
    { id: "3", name: "Modern Plumbing", tags: ["Plumbing"] },
    { id: "4", name: "Steel Works Co", tags: ["Construction", "Steel"] },
    {
        id: "5",
        name: "Elite Contractors",
        tags: ["Construction", "Electrical"],
    },
];

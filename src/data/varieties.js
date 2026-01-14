export const TRADING_VARIETIES = [
    {
        id: 'steel',
        name: '钢材',
        subTypes: [
            { id: 'rebar', name: '螺纹钢', attributes: ['品牌', '规格', '直径', '长度', '材质'], unit: '元/吨' },
            { id: 'hrc', name: '热轧卷板', attributes: ['品牌', '规格', '材质'], unit: '元/吨' },
            { id: 'crc', name: '冷轧卷板', attributes: ['品牌', '规格', '材质'], unit: '元/吨' },
            { id: 'strip', name: '带钢', attributes: ['品牌', '规格', '材质'], unit: '元/吨' },
            { id: 'billet', name: '钢坯', attributes: ['品牌', '规格', '材质'], unit: '元/吨' },
            { id: 'cr-base', name: '冷轧基料', attributes: ['品牌', '规格', '材质'], unit: '元/吨' },
        ]
    },
    {
        id: 'iron-ore',
        name: '铁矿',
        subTypes: [
            { id: 'pb-fines', name: 'PB粉', attributes: ['港口', '品牌', '供应商', '品位'], unit: '元/吨' },
            { id: 'seaborne', name: '海漂铁矿石', attributes: ['港口', '品牌', '供应商', '品位'], unit: '元/吨' },
        ]
    },
    {
        id: 'chemicals',
        name: '化工',
        subTypes: [
            { id: 'methanol', name: '甲醇', attributes: ['品级', '单位暂无'], unit: '元/吨' },
            { id: 'benzene', name: '纯苯', attributes: ['品级', '单位暂无'], unit: '元/吨' },
            { id: 'styrene', name: '苯乙烯', attributes: ['品级', '单位暂无'], unit: '元/吨' },
        ]
    }
];

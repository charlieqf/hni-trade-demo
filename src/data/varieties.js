export const TRADING_VARIETIES = [
    {
        id: 'steel',
        name: '钢材',
        subTypes: [
            {
                id: 'rebar',
                name: '螺纹钢',
                attributes: [
                    { name: '品牌', options: ['沙钢', '永钢', '中天', '马钢', '宝钢', '本钢', '鞍钢'] },
                    { name: '规格', options: ['Φ12', 'Φ14', 'Φ16', 'Φ18-25', 'Φ28', 'Φ32'] },
                    { name: '直径', options: ['12mm', '16mm', '20mm', '25mm'] },
                    { name: '长度', options: ['9m', '12m'] },
                    { name: '材质', options: ['HRB400', 'HRB400E', 'HRB500'] }
                ],
                unit: '元/吨'
            },
            {
                id: 'hrc',
                name: '热轧卷板',
                attributes: [
                    { name: '品牌', options: ['沙钢', '永钢', '宝钢', '宁钢', '通钢', '首钢'] },
                    { name: '规格', options: ['2.0-3.0', '3.0-4.0', '4.75-11.75', '11.75+'] },
                    { name: '材质', options: ['Q235B', 'Q355B', 'SS400'] }
                ],
                unit: '元/吨'
            },
            {
                id: 'crc',
                name: '冷轧卷板',
                attributes: [
                    { name: '品牌', options: ['宝钢', '鞍钢', '本钢', '马钢', '首钢'] },
                    { name: '规格', options: ['0.5mm', '0.8mm', '1.0mm', '1.2mm', '1.5mm', '2.0mm'] },
                    { name: '材质', options: ['SPCC', 'SPCD', 'DC01'] }
                ],
                unit: '元/吨'
            },
            {
                id: 'strip',
                name: '带钢',
                attributes: [
                    { name: '品牌', options: ['唐山瑞丰', '津西', '德龙', '建龙'] },
                    { name: '规格', options: ['2.5*232', '2.5*355', '3.5*685'] },
                    { name: '材质', options: ['Q235', 'Q355'] }
                ],
                unit: '元/吨'
            },
            {
                id: 'billet',
                name: '钢坯',
                attributes: [
                    { name: '品牌', options: ['唐钢', '燕钢', '松汀', '荣信'] },
                    { name: '规格', options: ['150*150'] },
                    { name: '材质', options: ['Q235', 'Q355', '20MnSi'] }
                ],
                unit: '元/吨'
            },
        ]
    },
    {
        id: 'iron-ore',
        name: '铁矿',
        subTypes: [
            {
                id: 'pb-fines',
                name: 'PB粉',
                attributes: [
                    { name: '港口', options: ['日照港', '青岛港', '曹妃甸', '岚山港', '连云港', '天津港'] },
                    { name: '品牌', options: ['力拓', '必和必拓', 'FMG', '淡水河谷'] },
                    { name: '供应商', options: ['中粮', '中建材', '海汽大宗', '沙钢贸易'] },
                    { name: '品位', options: ['61.5%', '62%', '65%'] }
                ],
                unit: '元/吨'
            },
            {
                id: 'seaborne',
                name: '海漂铁矿石',
                attributes: [
                    { name: '装运港', options: ['海德兰港', '达皮尔港', '图巴朗港'] },
                    { name: '品牌', options: ['PB粉', '纽曼粉', '金布巴粉', '卡粉'] },
                    { name: '供应商', options: ['Rio Tinto', 'BHP', 'Vale', 'FMG'] },
                    { name: '品位', options: ['61.5%', '62%', '65%'] }
                ],
                unit: '元/吨'
            },
        ]
    },
    {
        id: 'chemicals',
        name: '化工',
        subTypes: [
            {
                id: 'methanol',
                name: '甲醇',
                attributes: [
                    { name: '品级', options: ['优等品', '一等品', '合格品'] },
                    { name: '产地', options: ['中东', '南美', '国产'] },
                    { name: '储存地', options: ['太仓隔库', '张家港库', '南通库'] }
                ],
                unit: '元/吨'
            },
            {
                id: 'benzene',
                name: '纯苯',
                attributes: [
                    { name: '品级', options: ['石油苯', '加氢苯', '焦化苯'] },
                    { name: '产地', options: ['江苏', '浙江', '山东'] },
                    { name: '规格', options: ['工业级', '试剂级'] }
                ],
                unit: '元/吨'
            },
            {
                id: 'styrene',
                name: '苯乙烯',
                attributes: [
                    { name: '品级', options: ['优等品', '一等品'] },
                    { name: '产地', options: ['常州', '宁波', '上海'] },
                    { name: '运输方式', options: ['船运', '槽车'] }
                ],
                unit: '元/吨'
            }
        ]
    }
];

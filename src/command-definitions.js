
export default [
    {
        param: '--srcDir',
        alias: '-s',
        objectPath: 'srcDir',
        needsValue: true,
        commands: ['resolve', 'wrap'],
    },
    {
        param: '--outDir',
        alias: '-o',
        objectPath: 'outDir',
        needsValue: true,
        commands: ['resolve', 'wrap'],
    },
    {
        param: '--onTheSpot',
        objectPath: 'onTheSpot',
        needsValue: false,
        commands: ['resolve', 'wrap'],
    },
    {
        param: '--formats',
        alias: '-f',
        objectPath: 'formats',
        needsValue: true,
        canBeList: true,
        commands: ['resolve', 'wrap'],
    },
    {
        param: '--log',
        alias: '-l',
        objectPath: 'log',
        needsValue: false,
    },
    {
        param: '--preprocessDefines',
        objectPath: 'preprocessOptions.defines',
        needsValue: true,
        canBeList: true,
        commands: ['resolve', 'wrap'],
    },
    {
        param: '--preprocessMode',
        objectPath: 'preprocessOptions.mode',
        needsValue: true,
        canBeList: true,
        commands: ['resolve', 'wrap'],
    },
    {
        param: '--config',
        alias: '-c',
        objectPath: 'config',
        needsValue: true,
        commands: ['resolve', 'wrap'],
    },
];
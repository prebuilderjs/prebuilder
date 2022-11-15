
export default [
    {
        param: '--srcDir',
        alias: '-d',
        objectPath: 'srcDir',
        needsValue: true,
        commands: ['resolve', 'wrap'],
    },
    {
        param: '--outDir',
        alias: '-od',
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
        objectPath: 'log',
        needsValue: false,
    },
    {
        param: '--preprocessDefines',
        alias: '-defs',
        objectPath: 'preprocessOptions.defines',
        needsValue: true,
        canBeList: true,
        commands: ['resolve', 'wrap'],
    },
    {
        param: '--preprocessMode',
        alias: '-mode',
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
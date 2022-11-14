
export default [
    {
        param: '--dir',
        alias: '-d',
        objectPath: 'dir',
        needsValue: true,
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
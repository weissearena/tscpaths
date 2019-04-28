export interface TSAliasMap {
    [alias: string]: string[];
}
interface TSConfig {
    projectRoot: string;
    outRoot: string;
    aliases: TSAliasMap;
}
export declare function loadTSConfig(projectFile: string): TSConfig;
export {};

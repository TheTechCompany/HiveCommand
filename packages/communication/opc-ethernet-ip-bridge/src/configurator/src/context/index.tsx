import React from 'react';
import { Tag, Template } from '../App';

export const ConfiguratorContext = React.createContext<{
    tags?: Tag[],
    templates?: Template[],
    whitelist?: {tags: Tag[], templates: Template[]},
    tagExists?: (path: string, whitelist: Tag[], cwd?: string) => boolean
    templateExists?: (path: string, whitelist: Template[], cwd?: string) => boolean
    updateTags?: (type: string, add: boolean, path: string | undefined, name: string) => void;
}>({

});

export const ConfiguratorProvider = ConfiguratorContext.Provider;
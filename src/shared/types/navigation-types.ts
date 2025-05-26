// src/types/navigation-types.ts
export type RootStackParamList = {
    Main: undefined;
    Capture: { type: string, sagaId?: string };
    Loop: { sagaId?: string };
    Path: { sagaId?: string };
    SagaDetail: { sagaId: string };
    ThemeInspector: undefined;
    ComponentShowcase: undefined;
    TestScreen: undefined;

    // New unified screens with create/edit/view modes
    NoteScreen: {
        mode: 'create' | 'edit' | 'view',
        id?: string
    };
    SparkScreen: {
        mode: 'create' | 'edit' | 'view',
        id?: string
    };
    ActionScreen: {
        mode: 'create' | 'edit' | 'view',
        id?: string,
        parentId?: string,
        parentType?: 'path' | 'milestone' | 'loop-item'
    };
    PathScreen: {
        mode: 'create' | 'edit' | 'view',
        id?: string
    };
    LoopScreen: {
        mode: 'create' | 'edit' | 'view',
        id?: string
    };
};
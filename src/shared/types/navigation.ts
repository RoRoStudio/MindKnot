// Navigation types for the application

export type RootStackParamList = {
    // Main tabs
    Home: undefined;
    Sagas: undefined;
    Vault: undefined;
    Momentum: undefined;

    // Entry screens
    NoteScreen: { mode: 'create' | 'edit' | 'view'; id?: string };
    SparkScreen: { mode: 'create' | 'edit' | 'view'; id?: string };
    ActionScreen: { mode: 'create' | 'edit' | 'view'; id?: string };
    PathScreen: { mode: 'create' | 'edit' | 'view'; id?: string };
    SagaScreen: { mode: 'create' | 'edit' | 'view'; id?: string };
    LoopScreen: { mode: 'create' | 'edit' | 'view'; id?: string };

    // Detail screens
    SagaDetailScreen: { id: string };
    LoopExecutionScreen: { loopId: string };

    // Dev screens
    ComponentShowcaseScreen: undefined;
    ThemeInspectorScreen: undefined;
    TestScreen: undefined;
}; 
// Navigation types for the application

export type RootStackParamList = {
    // Main navigation
    Main: undefined;

    // Main tabs
    Home: undefined;
    Sagas: undefined;
    Vault: undefined;
    Momentum: undefined;

    // Entry screens
    NoteScreen: { mode: 'create' | 'edit' | 'view'; id?: string };
    SparkScreen: { mode: 'create' | 'edit' | 'view'; id?: string };
    ActionScreen: { mode: 'create' | 'edit' | 'view'; id?: string; parentId?: string; parentType?: 'path' | 'milestone' | 'loop-item' };
    PathScreen: { mode: 'create' | 'edit' | 'view'; id?: string };
    SagaScreen: { mode: 'create' | 'edit' | 'view'; id?: string };
    LoopScreen: { mode: 'create' | 'edit' | 'view'; id?: string };

    // Detail screens
    SagaDetail: { sagaId: string };
    SagaDetailScreen: { id: string };
    LoopDetailsScreen: { loopId: string };
    LoopBuilderScreen: { mode?: 'create' | 'edit' | 'view'; id?: string };
    LoopExecutionScreen: { loopId: string; sessionId?: string };
    LoopSummaryScreen: { sessionId: string; loopId: string };
    LoopListScreen: undefined;

    // Dev screens
    ComponentShowcase: undefined;
    ComponentShowcaseScreen: undefined;
    ThemeInspector: undefined;
    ThemeInspectorScreen: undefined;
    TestScreen: undefined;

    // Screens
    HomeScreen: undefined;
    VaultLoopsScreen: undefined;
    MomentumScreen: undefined;
    DevScreen: undefined;
}; 
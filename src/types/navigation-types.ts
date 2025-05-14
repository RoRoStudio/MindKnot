// src/types/navigation-types.ts
export type RootStackParamList = {
    Main: undefined;
    Capture: { type: string, sagaId?: string };
    Loop: { sagaId?: string };
    Path: { sagaId?: string };
    SagaDetail: { sagaId: string };
    ThemeInspector: undefined;
};
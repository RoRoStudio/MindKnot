# Simplified Codebase Structure Proposal

## Core Principle: Easy to Find, Easy to Understand

### New Structure (Much Simpler)

```
src/
├── shared/                           # Truly shared across ALL features
│   ├── components/                   # Reusable UI components
│   │   ├── Button.tsx               # MOVED + theme-ified
│   │   ├── Card.tsx                 # MOVED + theme-ified
│   │   ├── Input.tsx                # MOVED + theme-ified
│   │   ├── Modal.tsx                # MOVED + theme-ified
│   │   ├── Timer.tsx                # MOVED + theme-ified
│   │   ├── EntryCard.tsx            # MOVED (used by all entry types)
│   │   └── index.ts                 # Export all
│   ├── hooks/                       # Shared hooks
│   │   ├── useTheme.ts              # MOVED
│   │   ├── useDatabase.ts           # MOVED
│   │   └── index.ts
│   ├── services/                    # Shared services
│   │   ├── database.ts              # MOVED
│   │   ├── storage.ts               # NEW
│   │   └── background.ts            # NEW (for loops)
│   ├── types/                       # Shared types
│   │   ├── common.ts                # MOVED
│   │   ├── navigation.ts            # MOVED
│   │   └── index.ts
│   └── utils/                       # Shared utilities
│       ├── dateUtils.ts             # MOVED
│       ├── validation.ts            # NEW
│       └── index.ts

├── features/                        # One folder per entry type
│   ├── actions/                     # Simple structure for simple features
│   │   ├── components/              # All action components
│   │   │   ├── ActionCard.tsx       # MOVED
│   │   │   ├── ActionForm.tsx       # MOVED
│   │   │   └── index.ts
│   │   ├── screens/                 # All action screens
│   │   │   ├── ActionScreen.tsx     # MOVED
│   │   │   └── index.ts
│   │   ├── hooks/                   # Action-specific hooks
│   │   │   ├── useActions.ts        # MOVED
│   │   │   └── index.ts
│   │   ├── store/                   # Action state management
│   │   │   ├── actionSlice.ts       # MOVED
│   │   │   └── index.ts
│   │   ├── types.ts                 # All action types in one file
│   │   ├── service.ts               # All action business logic
│   │   └── index.ts                 # Feature exports
│   │
│   ├── notes/                       # Same simple pattern
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types.ts
│   │   ├── service.ts
│   │   └── index.ts
│   │
│   ├── paths/                       # Same simple pattern
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types.ts
│   │   ├── service.ts
│   │   └── index.ts
│   │
│   ├── sagas/                       # Same simple pattern
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types.ts
│   │   ├── service.ts
│   │   └── index.ts
│   │
│   ├── sparks/                      # Same simple pattern
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types.ts
│   │   ├── service.ts
│   │   └── index.ts
│   │
│   └── loops/                       # ONLY loops gets complex structure (it needs it)
│       ├── components/              # All loop UI components
│       │   ├── LoopCard.tsx         # NEW
│       │   ├── LoopBuilder.tsx      # NEW
│       │   ├── ExecutionController.tsx # NEW
│       │   ├── ActivityRunner.tsx   # NEW
│       │   ├── TimerDisplay.tsx     # NEW
│       │   └── index.ts
│       ├── screens/                 # All loop screens
│       │   ├── LoopListScreen.tsx   # NEW
│       │   ├── LoopBuilderScreen.tsx # NEW
│       │   ├── ExecutionScreen.tsx  # NEW
│       │   └── index.ts
│       ├── hooks/                   # Loop-specific hooks
│       │   ├── useLoops.ts          # NEW
│       │   ├── useExecution.ts      # NEW
│       │   ├── useBackgroundTimer.ts # NEW
│       │   └── index.ts
│       ├── store/                   # Loop state management
│       │   ├── loopSlice.ts         # NEW
│       │   ├── executionSlice.ts    # NEW
│       │   └── index.ts
│       ├── services/                # Complex business logic (only for loops)
│       │   ├── ExecutionEngine.ts   # NEW - background execution
│       │   ├── TimerService.ts      # NEW - background timers
│       │   ├── RecoveryService.ts   # NEW - crash recovery
│       │   └── index.ts
│       ├── types.ts                 # All loop types
│       └── index.ts                 # Feature exports

└── app/                             # App-level configuration
    ├── navigation/                  # App navigation
    │   ├── AppNavigator.tsx         # MOVED
    │   ├── TabNavigator.tsx         # MOVED
    │   └── index.ts
    ├── store/                       # Global store setup
    │   ├── store.ts                 # NEW - combine all feature stores
    │   ├── hooks.ts                 # MOVED
    │   └── index.ts
    ├── theme/                       # App theming
    │   ├── colors.ts                # MOVED
    │   ├── typography.ts            # MOVED
    │   ├── ThemeProvider.tsx        # MOVED
    │   └── index.ts
    └── contexts/                    # App contexts
        ├── ThemeContext.tsx         # MOVED
        └── index.ts
```

## Key Simplifications

### 1. Flat Feature Structure
- Most features: `components/`, `screens/`, `hooks/`, `store/`, `types.ts`, `service.ts`
- Only 2 levels deep maximum
- Easy to remember pattern

### 2. Single Files for Simple Things
- `types.ts` instead of `types/` folder for most features
- `service.ts` instead of complex domain/data separation
- Less navigation, more productivity

### 3. Complexity Only Where Needed
- Only loops gets complex structure because it needs background execution
- Other features stay simple and maintainable

### 4. Clear Mental Model
- `shared/` = used by multiple features
- `features/[name]/` = everything for that feature
- `app/` = app-wide configuration

## Benefits of This Approach

### ✅ Easy to Navigate
- "Where's the action form?" → `features/actions/components/ActionForm.tsx`
- "Where's the loop execution logic?" → `features/loops/services/ExecutionEngine.ts`
- "Where's the shared button?" → `shared/components/Button.tsx`

### ✅ Easy to Understand
- Consistent pattern across features
- No guessing about folder structure
- Clear separation of concerns without over-engineering

### ✅ Easy to Scale
- Add new features by copying the pattern
- Complex features can add more folders if needed
- Simple features stay simple

### ✅ Easy to Find Code
- Related code is co-located
- No deep nesting to navigate
- Predictable file locations

## Migration Strategy

### Phase 1: Create Simple Structure (1 day)
```bash
# Create the simplified structure
mkdir -p src/shared/{components,hooks,services,types,utils}
mkdir -p src/features/{actions,notes,paths,sagas,sparks,loops}/{components,screens,hooks,store}
mkdir -p src/features/loops/services
mkdir -p src/app/{navigation,store,theme,contexts}
```

### Phase 2: Move Files to Simple Structure (2 days)
- Move existing files to new locations
- Create single `types.ts` and `service.ts` files per feature
- Update imports

### Phase 3: Implement Complex Loops (5 days)
- Build the background execution engine
- Create loop-specific services
- Implement the execution system

## File Count Comparison

**Current Complex Plan**: ~200+ files across deep folder structure
**Simplified Plan**: ~80 files in predictable locations

## Developer Experience

**Finding a component**: 
- Complex: "Is it in presentation/components/cards/ or presentation/components/builders/?"
- Simple: "It's in components/"

**Adding a feature**:
- Complex: Create 15+ folders and understand domain/data/presentation separation
- Simple: Copy the pattern from another feature

**Understanding the codebase**:
- Complex: Need to understand clean architecture principles
- Simple: Folders match what they contain

## Recommendation

I strongly recommend the simplified structure because:

1. **You won't get lost** - predictable, shallow structure
2. **Faster development** - less time navigating folders
3. **Easier onboarding** - new developers understand it immediately
4. **Still achieves goals** - shared components, theme consistency, background execution
5. **Room to grow** - can add complexity where actually needed

The complex structure was over-engineered for the actual needs. This simplified version gives us 90% of the benefits with 50% of the complexity.

**Should we proceed with this simplified structure instead?** 
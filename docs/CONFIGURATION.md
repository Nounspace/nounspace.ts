# Configuration Guide

## Environment Variables

The application uses environment variables to configure community-specific settings and external services.

### Community Configuration

The most important environment variable for whitelabeling is:

```bash
NEXT_PUBLIC_COMMUNITY=nouns
```

This determines which community configuration to load. Available options:
- `nouns` (default) - Uses the Nouns community configuration
- `example` - Uses the example community configuration template

### Required Environment Variables

```bash
# Community Configuration
NEXT_PUBLIC_COMMUNITY=nouns

# Database Configuration (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Authentication Configuration (Privy)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Blockchain Configuration
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Neynar API Configuration
NEYNAR_API_KEY=your_neynar_api_key_here

# Application URLs
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
```

## Configuration Loading

The application automatically loads the appropriate configuration based on the `NEXT_PUBLIC_COMMUNITY` environment variable:

1. **Environment Variable Reading**: The system reads `NEXT_PUBLIC_COMMUNITY` from environment variables
2. **Validation**: Validates that the configuration exists in the available configurations
3. **Fallback**: Falls back to the `nouns` configuration if an invalid or missing value is provided
4. **Loading**: Loads the corresponding community configuration

## Configuration Structure

The configuration is organized into community-specific folders:

```
src/config/
├── nouns/                    # Nouns community configuration
│   ├── nouns.brand.ts        # Brand identity
│   ├── nouns.assets.ts       # Visual assets
│   ├── nouns.theme.ts        # Theme definitions
│   ├── nouns.community.ts    # Community integration
│   ├── nouns.fidgets.ts      # Fidget management
│   ├── nouns.home.ts         # Home page configuration
│   ├── initial*.ts           # Initial space templates
│   └── index.ts              # Configuration export
├── example/                  # Example community configuration
│   ├── example.brand.ts      # Brand identity template
│   ├── example.assets.ts     # Visual assets template
│   ├── example.theme.ts      # Theme definitions template
│   ├── example.community.ts  # Community integration template
│   ├── example.fidgets.ts    # Fidget management template
│   ├── example.home.ts       # Home page configuration template
│   ├── example.initialSpaces.ts # Initial space templates
│   └── index.ts              # Configuration export
├── systemConfig.ts           # System configuration interface
├── initialSpaceConfig.ts     # Base space configuration
└── index.ts                  # Main configuration loader
```

## Build-Time Configuration

The system uses build-time configuration to determine which community configuration to use. This means:

1. **Environment Variable**: Set `NEXT_PUBLIC_COMMUNITY` at build time
2. **Build Process**: The configuration is baked into the build
3. **No Runtime Switching**: The configuration cannot be changed after build

### Building Different Communities

**For Nouns community (default):**
```bash
npm run build
# or explicitly
NEXT_PUBLIC_COMMUNITY=nouns npm run build
```

**For Example community:**
```bash
NEXT_PUBLIC_COMMUNITY=example npm run build
```

### Development

**For Nouns development:**
```bash
npm run dev
# or explicitly
NEXT_PUBLIC_COMMUNITY=nouns npm run dev
```

**For Example development:**
```bash
NEXT_PUBLIC_COMMUNITY=example npm run dev
```

### What Gets Configured

When you set `NEXT_PUBLIC_COMMUNITY=example`, the system will:

1. **Load example system config** (brand, assets, theme, community settings)
2. **Use example fidget configurations**
3. **Use example home page configuration**
4. **Use example initial space templates** (profile, channel, token, proposal, homebase)

## Adding New Community Configurations

To add a new community configuration:

1. Create a new folder under `src/config/` (e.g., `src/config/mycommunity/`)
2. Copy the structure from `src/config/example/` as a template
3. Update all configuration files with your community's specific values
4. Add the new configuration to the `AVAILABLE_CONFIGURATIONS` array in `src/config/index.ts`
5. Add a new case to the switch statement in `loadSystemConfig()`
6. Update this documentation

## Development vs Production

- **Development**: Uses local environment variables from `.env.local` or `.env`
- **Production**: Uses environment variables set in your deployment platform (Vercel, etc.)

## Configuration Validation

The system includes built-in validation that:
- Checks if the provided community configuration is valid
- Logs warnings for invalid configurations
- Provides helpful error messages with available options
- Always falls back to a working configuration (nouns)

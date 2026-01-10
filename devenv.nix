{
  pkgs,
  lib,
  config,
  inputs,
  ...
}: {
  # https://devenv.sh/basics/
  env.PGDATABASE = "rbi_inventory";
  env.DATABASE_URL = "postgresql://${builtins.getEnv "USER"}@127.0.0.1:5432/rbi_inventory?sslmode=disable";
  env.NEST_PORT = "3001";
  env.VITE_API_BASE_URL = "http://localhost:8080";

  # https://devenv.sh/packages/
  # Only packages not provided by languages.* modules
  packages = [
    pkgs.just
    pkgs.docker
    pkgs.docker-compose
    pkgs.typescript
    pkgs.nodePackages.prettier
  ];

  # https://devenv.sh/languages/
  languages.python = {
    enable = true;
    package = pkgs.python312;
    venv = {
      enable = true;
      requirements = ''
        mkdocs-material>=9.5.0
        mkdocs-static-i18n>=1.2.0
        mkdocs-git-revision-date-localized-plugin>=1.2.0
        pymdown-extensions>=10.0
      '';
    };
  };

  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    pnpm = {
      enable = true;
      package = pkgs.pnpm_10;
    };
  };

  # https://devenv.sh/services/
  services.postgres = {
    enable = true;
    package = pkgs.postgresql_16;
    initialDatabases = [
      {name = "rbi_inventory";}
    ];
    listen_addresses = "127.0.0.1";
  };

  # https://devenv.sh/processes/
  processes.nest.exec = "cd modules/api && pnpm start:dev";
  processes.web.exec = "cd modules/web && pnpm dev";
  processes.docs.exec = "mkdocs serve -a 127.0.0.1:8000";

  # https://devenv.sh/pre-commit-hooks/
  git-hooks.hooks = {
    prettier.enable = true;
    nixfmt-rfc-style.enable = true;
  };

  enterShell = ''
    echo ""
    echo "RBI Inventory Development Environment"
    echo "======================================"
    echo ""
    echo "PostgreSQL:"
    echo "  Database: $PGDATABASE"
    echo ""
    echo "Services:"
    echo "  devenv up    - Start all services (PostgreSQL, NestJS, Web, Docs)"
    echo "  devenv down  - Stop all services"
    echo ""
    echo "Documentation:"
    echo "  mkdocs serve       - Start docs server at http://localhost:8000"
    echo "  mkdocs build       - Build static docs site"
    echo ""
    echo "Tools available:"
    echo "  Node: $(node --version)"
    echo "  pnpm: $(pnpm --version)"
    echo "  Python: $(python --version)"
    echo ""
  '';
}

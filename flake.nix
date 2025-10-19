{
  description = "Dev env for inventory suite";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
    in {
      devShells.default = pkgs.mkShell {
        # Toolchain & services
        buildInputs = [
          pkgs.go_1_24 # Go toolchain
          pkgs.delve # Debugger (dlv)
          pkgs.go-tools # go vet, godoc, etc.
          pkgs.gotestsum # Pretty test runner output

          pkgs.sqlc # Type-safe DB access codegen
          pkgs.goose # DB migrations

          pkgs.just # Task runner
          pkgs.pnpm_10 # Better npm

          pkgs.docker # Optional: local containers
          pkgs.docker-compose

          pkgs.postgresql
        ];

        shellHook = ''
          export GO111MODULE=on
          export CGO_ENABLED=1

          # Add ./bin (if you generate helpers) to PATH
          export PATH="$PWD/modules/api/bin:$PATH"

          # PostgreSQL configuration
          export PGDATA="$PWD/.postgres/data"
          export PGHOST="$PWD/.postgres"
          export PGDATABASE="rbi_inventory"
          export PGUSER="postgres"
          export DATABASE_URL="postgresql://$PGUSER@localhost/$PGDATABASE?host=$PGHOST"

          # Initialize PostgreSQL if not already done
          if [ ! -d "$PGDATA" ]; then
            echo "Initializing PostgreSQL database..."
            initdb --auth=trust --no-locale --encoding=UTF8 -U "$PGUSER"
            echo "unix_socket_directories = '$PGHOST'" >> "$PGDATA/postgresql.conf"
            echo "PostgreSQL initialized. Start it with: pg_ctl start"
            echo "Create database with: createdb $PGDATABASE"
          fi

          echo ""
          echo "PostgreSQL environment configured:"
          echo "  Data directory: $PGDATA"
          echo "  Database: $PGDATABASE"
          echo "  User: $PGUSER"
          echo ""
          echo "Useful commands:"
          echo "  pg_ctl start           - Start PostgreSQL server"
          echo "  pg_ctl stop            - Stop PostgreSQL server"
          echo "  pg_ctl status          - Check server status"
          echo "  createdb $PGDATABASE   - Create the database"
          echo "  psql                   - Connect to database"
          echo ""
        '';
      };
    });
}

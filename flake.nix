{
  description = "A very basic flake";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem
    (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        formatter = pkgs.alejandra;
        packages.default = pkgs.buildNpmPackage rec {
          pname = "litheumbco";
          version = "0.0.0";

          src = ./.;

          npmDepsHash = "sha256-jGZz7ZmZprC1HKN/HF2g5wGUgtty6C4c2gA3IJgT3s8=";

          #NODE_OPTIONS = "--openssl-legacy-provider";
          preBuild = ''
            npm run generate-types
          '';

          installPhase = ''
            runHook preInstall
            cp -r ./dist $out
            runHook postInstall
          '';
        };
      }
    );
}

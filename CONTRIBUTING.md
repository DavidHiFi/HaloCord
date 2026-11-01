# Contributing to HaloCord

Thanks for helping. Bug reports, ideas and pull requests are all welcome.

## Reporting a bug

[Open an issue](https://github.com/DavidHiFi/HaloCord/issues/new) and include:

- what you did, what you expected and what happened instead
- your Windows version and the HaloCord version (bottom of the Settings sidebar, for example `HaloCord v2.9.3`)
- a screenshot if the problem is visual

## Suggesting a feature

Open an issue that describes what you want and why. A mock-up helps.

## Sending a pull request

1. Fork the repo and create a branch from `main`.
2. Build and run your change as [docs/building.md](docs/building.md) describes.
   Plugin changes go under `src/`; desktop app changes go in `desktop/`.
   Run `pnpm test` before you open the pull request.
3. Keep each pull request to one change, and say in the description how you tested it.
4. Keep license headers and author credits in any file you touch.

Theme changes belong in
[MochaCord Theme](https://github.com/DavidHiFi/MochaCord-Theme).

## License

By contributing, you agree that your work is released under the license of the folder you change:
the [MIT license](desktop/LICENSE) for `desktop/`, [GPL-3.0](LICENSE) for everything else.

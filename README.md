<h1 align="center">
  <a href="https://facuz.github.io/gitowl"><img src="src/themes/default/img/logo-dark.png" alt="Gitowl" width="450"></a>
  <br>
</h1>

<h4 align="center">A powerful and small framework ready to publish documents in Github Pages or private servers.</h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#download">Download</a> •
  <a href="#credits">Credits</a> •
  <a href="#related">Support</a> •
  <a href="#license">License</a>
</p>

<div align="center">
  <img src="src/themes/default/img/demo.png" alt="GitOwl">
</div>

## Key Features

* Fully compatible with Github Pages
* No backend or database is needed
* Only need to configure the routes
* It weighs less than 100kb
* You can write with Markdown or Html
* Editing directly from Github
* Supports multiple themes
* It can be divided into versions and languages
* Fully configurable and customisable

## How To Use

You only need to [download](#) the latest release and copy it to the folder where Github Pages are enabled (Ex: Docs)

Gitowl has two important files `config.yaml` and `routes.yaml`, that you can edit.

It can make different routes arrangements. The easy way is to create a folder by subject and put in the `.md` or `.html` files. All files and folders must be declared in the `routes.yaml`

```yaml
- id: 1
  title: Folder Title
  folder: path
  items:
  - title: Title 1
    file: file1.md
  - title: Title 2
    file: file2.md

- id: 2
  title: Without folder
  file: file.md
```
You can edit all files directly from GitHub.

For more details [read the documentation](#)

## Download

You can [download](#) latest stable release. (When version 1.0 is ready)

## Credits

This software uses code from several open source packages.

- [Showdown](http://showdownjs.github.io/showdown/)
- [Bootstrap](https://getbootstrap.com/)
- [Js-yaml](https://github.com/nodeca/js-yaml)
- [Perfect-scrollbar](https://github.com/utatti/perfect-scrollbar)
- [NProgress](https://github.com/rstacruz/nprogress)
- [Highlight.js](https://highlightjs.org/)

> GitOwl is highly inspired by [grav-learn](https://github.com/getgrav/grav-learn) but doesn't use its code.

## Support

You can help in different ways:

- Use it!
- Put us a star on github
- Warn us if you found a bug
- Correct my English
- Share it with everyone
- Buy me a [coffee](https://www.paypal.me/FaCuZ)

> I really need coffee!

## License

MIT is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
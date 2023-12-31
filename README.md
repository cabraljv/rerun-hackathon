# Rerun-Hackathon ODL Class Generator

We took some decisions to improve the productivity of the development, such as:

- SQLite as database, because it is easy to use and we don't need to install any database server.
- Knex as query builder, because it is easy to use and it is compatible with SQLite.
- Bun as JavaScript runtime, because it is fast and ir was the perfect opportunity to apply it into a project.
- Created the get/set methods even thought is not needed in JS, because the generator can be edited in the future to run some validations in the setters.
- n:m relations are not supported at this time, but it can be easily implemented in the future.


## Usage

First of all, you need to install [Bun](https://bun.sh) to run this project.
```bash
curl -fsSL https://bun.sh/install | bash
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun odl-parser -i <input-file> -o <output-dir>
```

## How it works

The generator have 3 main steps:

- Parse the ODL file to generate a AST (Abstract Syntax Tree) in JSON using a home built parser.
- Generate the JS class using the AST.
- Generate the SQL script to create the table using the AST considering relations.

## Examples

### Input

```
struct Endereco
{
    attribute string logradouro
    attribute string complemento
    attribute string bairro
    attribute string cidade
    attribute string estado
    attribute string cep
}
```

### Generated JS Class

```js

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './database.sqlite'
  }
});
class Endereco {
  constructor(logradouro, complemento, bairro, cidade, estado, cep) {
    this._logradouro = logradouro
    this._complemento = complemento
    this._bairro = bairro
    this._cidade = cidade
    this._estado = estado
    this._cep = cep
  }
  constructor(id) {
    this.id = id;
  }
  get logradouro() {
    return this._logradouro;
  }
  set logradouro(logradouro) {
    this._logradouro = logradouro;
  }
  get complemento() {
    return this._complemento;
  }
  set complemento(complemento) {
    this._complemento = complemento;
  }
  get bairro() {
    return this._bairro;
  }
  set bairro(bairro) {
    this._bairro = bairro;
  }
  get cidade() {
    return this._cidade;
  }
  set cidade(cidade) {
    this._cidade = cidade;
  }
  get estado() {
    return this._estado;
  }
  set estado(estado) {
    this._estado = estado;
  }
  get cep() {
    return this._cep;
  }
  set cep(cep) {
    this._cep = cep;
  }
  async save() {
    const id = await knex('Endereco').insert(this);
    this.id = id;
    return this;
  }
  async read() {
    const result = await knex('Endereco').where({ id: this.id });
    this.logradouro = result.logradouro
    this.complemento = result.complemento
    this.bairro = result.bairro
    this.cidade = result.cidade
    this.estado = result.estado
    this.cep = result.cep
  }
  async update() {
    await knex('Endereco').where({ id: this.id }).update(this);
    return this;
  }
  async delete() {
    await knex('Endereco').where({ id: this.id }).delete();
  }
}
module.exports = Endereco;

```
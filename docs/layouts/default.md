# {%= name %} {%= badge.npm %} {%= badge.travis %}

> {%= description %}

## Install
{%= include("install-npm", {save: true}) %}

## Usage
{% body %}

## Related projects
{%= related(verb.related.list) %}  

## Running tests
{%= include("tests") %}

## Contributing
{%= include("contributing") %}

## Author
{%= include("author") %}

## License
{%= copyright({start: '2015', linkify: true}) %}
{%= license %}

***

{%= include("footer") %}

{%= reflinks(['verb', 'generate'].concat(Object.keys(dependencies).concat(Object.keys(devDependencies)))) %}

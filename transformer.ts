import ts from 'typescript';
import path from 'path';

const upper = (name) => name.charAt(0).toUpperCase() + name.slice(1)

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (file: ts.SourceFile) => visitNodeAndChildren(file, program, context);
}

function visitNodeAndChildren(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext): ts.SourceFile;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node | undefined;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node | undefined {
  return ts.visitEachChild(visitNode(node, program), childNode => visitNodeAndChildren(childNode, program, context), context);
}

function visitNode(node: ts.SourceFile, program: ts.Program): ts.SourceFile;
function visitNode(node: ts.Node, program: ts.Program): ts.Node | undefined;
function visitNode(node: ts.Node, program: ts.Program): ts.Node | undefined {
  const typeChecker = program.getTypeChecker();
  if (isKeysImportExpression(node)) {
    return;
  }
  if (!isKeysCallExpression(node, typeChecker)) {
    return node;
  }
  if (!node.typeArguments) {
    return ts.createObjectLiteral({});
  }
  const type = typeChecker.getTypeFromTypeNode(node.typeArguments[0]);
  const properties = typeChecker.getPropertiesOfType(type);
  const target = properties.map(property => {
    const t = typeChecker.getTypeAtLocation(property.valueDeclaration)
    // console.log('t', t)
    let type = ts.createIdentifier("Object")
    if (t.symbol && t.symbol.escapedName) {
      type = ts.createIdentifier(t.symbol.escapedName)
    } else if (t.intrinsicName) {
      type = ts.createIdentifier(upper(t.intrinsicName))
    } else if (t.types && t.types.length > 0) {
      const types = t.types.map(i => i.intrinsicName).filter(i => i !== 'undefined')
      if (types.length > 1) {
        type = ts.createArrayLiteral(types.map(i => ts.createIdentifier(upper(i))))
      } else if (types.length === 1) {
        type = ts.createIdentifier(upper(types[0]))
      }
    }
    return ts.createPropertyAssignment(ts.createStringLiteral(property.name), type)
  })
  return ts.createObjectLiteral(target, true);
  return ts.createArrayLiteral(properties.map(property => ts.createLiteral(property.name)));
}

const indexJs = path.join(__dirname, 'index.js');
function isKeysImportExpression(node: ts.Node): node is ts.ImportDeclaration {
  if (!ts.isImportDeclaration(node)) {
    return false;
  }
  const module = (node.moduleSpecifier as ts.StringLiteral).text;
  try {
    return indexJs === (
      module.startsWith('.')
        ? require.resolve(path.resolve(path.dirname(node.getSourceFile().fileName), module))
        : require.resolve(module)
    );
  } catch(e) {
    return false;
  }
}

const indexTs = path.join(__dirname, 'index.d.ts');
function isKeysCallExpression(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression {
  if (!ts.isCallExpression(node)) {
    return false;
  }
  const declaration = typeChecker.getResolvedSignature(node)?.declaration;
  if (!declaration || ts.isJSDocSignature(declaration) || declaration.name?.getText() !== 'props') {
    return false;
  }
  try {
    // require.resolve is required to resolve symlink.
    // https://github.com/kimamula/ts-transformer-keys/issues/4#issuecomment-643734716
    return require.resolve(declaration.getSourceFile().fileName) === indexTs;
  } catch {
    // declaration.getSourceFile().fileName may not be in Node.js require stack and require.resolve may result in an error.
    // https://github.com/kimamula/ts-transformer-keys/issues/47
    return false;
  }
}

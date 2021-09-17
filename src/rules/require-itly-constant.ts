import {
  AST_NODE_TYPES,
  ClassBody,
  ClassDeclaration,
  ClassProperty,
} from '@typescript-eslint/types/dist/ast-spec';
import * as util from '../util/from-eslint-typescript';

type Options = [{}];
type MessageIds = 'invalidFile' | 'missingItlyConstant';

export default util.createRule<Options, MessageIds>({
  name: 'require-itly-constant',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforces itly constant is set in Iteratively',
      recommended: false,
      category: 'Best Practices',
    },
    schema: [{}],
    messages: {
      invalidFile:
        'require-itly-constant should only be enabled for the generated Itly library',
      missingItlyConstant: `{{ eventName }} is missing the Iteratively property group`,
    },
  },
  defaultOptions: [{}],
  create: function (context) {
    function isItlyFile() {
      return context.getFilename().endsWith('itly/index.ts');
    }

    function classIsItlyEventImplementation(
      classDeclaration: ClassDeclaration,
    ) {
      return classDeclaration.implements?.find(
        (implementsNode) =>
          implementsNode.expression.type === AST_NODE_TYPES.Identifier &&
          implementsNode.expression.name === 'Event',
      );
    }

    function getItlyPropertiesDeclaration(classBody: ClassBody) {
      return classBody.body.find(
        (classProperty) =>
          classProperty.type === AST_NODE_TYPES.ClassProperty &&
          classProperty.key.type === AST_NODE_TYPES.Identifier &&
          classProperty.key.name === 'properties',
      );
    }

    function propertiesDeclarationContainsItlyConstant(
      propertiesDeclaration: ClassProperty,
    ) {
      if (
        propertiesDeclaration.typeAnnotation?.typeAnnotation.type ===
        AST_NODE_TYPES.TSIntersectionType
      ) {
        const containsItlyLiteral =
          propertiesDeclaration.typeAnnotation.typeAnnotation.types?.some(
            (type) =>
              type.type === AST_NODE_TYPES.TSTypeLiteral &&
              type.members.some(
                (member) =>
                  member.type === AST_NODE_TYPES.TSPropertySignature &&
                  member.key.type === AST_NODE_TYPES.Literal &&
                  member.key.value === 'itly',
              ),
          );
        return containsItlyLiteral;
      }

      if (
        propertiesDeclaration.value?.type === AST_NODE_TYPES.ObjectExpression
      ) {
        return propertiesDeclaration.value.properties.some(
          (property) =>
            property.type === AST_NODE_TYPES.Property &&
            property.key.type === AST_NODE_TYPES.Literal &&
            property.key.value === 'itly',
        );
      }

      return false;
    }

    function reportMissingItlyConstant(classDeclarationNode: ClassDeclaration) {
      context.report({
        node: classDeclarationNode,
        messageId: 'missingItlyConstant',
        data: { eventName: classDeclarationNode.id?.name },
      });
    }

    return {
      ClassDeclaration(classDeclarationNode) {
        if (!isItlyFile()) {
          context.report({
            node: classDeclarationNode,
            messageId: 'invalidFile',
          });
          return;
        }

        if (!classIsItlyEventImplementation(classDeclarationNode)) {
          return;
        }

        const itlyPropertiesDeclaration = getItlyPropertiesDeclaration(
          classDeclarationNode.body,
        );

        if (
          !itlyPropertiesDeclaration ||
          itlyPropertiesDeclaration.type !== AST_NODE_TYPES.ClassProperty
        ) {
          reportMissingItlyConstant(classDeclarationNode);
          return;
        }

        if (
          propertiesDeclarationContainsItlyConstant(itlyPropertiesDeclaration)
        ) {
          return;
        }

        reportMissingItlyConstant(classDeclarationNode);
      },
    };
  },
});

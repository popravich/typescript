/// <reference path="typescriptServices.ts" />
module TypeScript.Services {
    export class NavigationBarItemGetter {
        private hasGlobalNode = false;

        private getIndent(node: SyntaxNode): number {
            var indent = this.hasGlobalNode ? 1 : 0;

            var current = node.parent;
            while (current != null) {
                if (current.kind() == SyntaxKind.ModuleDeclaration) {
                    indent++;
                }

                current = current.parent;
            }

            return indent;
        }

        private getKindModifiers(modifiers: TypeScript.ISyntaxList<ISyntaxToken>): string {
            var result: string[] = [];

            for (var i = 0, n = modifiers.childCount(); i < n; i++) {
                result.push(modifiers.childAt(i).text());
            }

            return result.length > 0 ? result.join(',') : ScriptElementKindModifier.none;
        }

        public getItems(node: TypeScript.SourceUnitSyntax): NavigationBarItem[] {
            return this.getItemsWorker(() => this.getTopLevelNodes(node), n => this.createTopLevelItem(n));
        }

        private getChildNodes(nodes: ISyntaxList<IModuleElementSyntax>): SyntaxNode[] {
            var childNodes: SyntaxNode[] = [];

            for (var i = 0, n = nodes.childCount(); i < n; i++) {
                var node = <SyntaxNode>nodes.childAt(i);

                if (node.kind() === SyntaxKind.FunctionDeclaration) {
                    childNodes.push(node);
                }
                else if (node.kind() === SyntaxKind.VariableDeclaration) {
                    var variableDeclaration = <VariableDeclarationSyntax>node;
                    childNodes.push.apply(childNodes, variableDeclaration.variableDeclarators.toNonSeparatorArray());
                }
            }

            return childNodes;
        }

        private getTopLevelNodes(node: SourceUnitSyntax): SyntaxNode[] {
            var topLevelNodes: SyntaxNode[] = [];
            topLevelNodes.push(node);

            this.addTopLevelNodes(node.moduleElements, topLevelNodes);

            return topLevelNodes;
        }

        private addTopLevelNodes(nodes: ISyntaxList<IModuleElementSyntax>, topLevelNodes: SyntaxNode[]): void {
            for (var i = 0, n = nodes.childCount(); i < n; i++) {
                var node = nodes.childAt(i);
                switch (node.kind()) {
                    case SyntaxKind.ModuleDeclaration:
                    case SyntaxKind.ClassDeclaration:
                    case SyntaxKind.EnumDeclaration:
                    case SyntaxKind.InterfaceDeclaration:
                        topLevelNodes.push(<SyntaxNode>node);
                }

                if (node.kind() === SyntaxKind.ModuleDeclaration) {
                    this.addTopLevelNodes((<ModuleDeclarationSyntax>node).moduleElements, topLevelNodes);
                }
            }
        }

        private getItemsWorker(getNodes: () => SyntaxNode[], createItem: (n: SyntaxNode) => NavigationBarItem): NavigationBarItem[] {
            var items: NavigationBarItem[] = [];

            var keyToItem = createIntrinsicsObject<NavigationBarItem>();

            var nodes = getNodes();
            for (var i = 0, n = nodes.length; i < n; i++) {
                var child = nodes[i];
                var item = createItem(child);
                if (item != null) {
                    if (item.text.length > 0) {
                        var key = item.text + "-" + item.kind;

                        var itemWithSameName = keyToItem[key];
                        if (itemWithSameName) {
                            // We had an item with the same name.  Add our spans to its list of spans.
                            itemWithSameName.spans.push.apply(itemWithSameName.spans, item.spans);
                        }
                        else {
                            keyToItem[key] = item;
                            items.push(item);
                        }
                    }
                }
            }

            return items;
        }

        private createChildItem(node: SyntaxNode): NavigationBarItem {
            switch (node.kind()) {
                case SyntaxKind.Parameter:
                    var parameter = <ParameterSyntax>node;
                    if (parameter.modifiers.childCount() === 0) {
                        return null;
                    }
                    return new NavigationBarItem(parameter.identifier.text(), ScriptElementKind.memberVariableElement, this.getKindModifiers(parameter.modifiers), [TextSpan.fromBounds(node.start(), node.end())]);

                case SyntaxKind.MemberFunctionDeclaration:
                    var memberFunction = <MemberFunctionDeclarationSyntax>node;
                    return new NavigationBarItem(memberFunction.propertyName.text(), ScriptElementKind.memberFunctionElement, this.getKindModifiers(memberFunction.modifiers), [TextSpan.fromBounds(node.start(), node.end())]);

                case SyntaxKind.GetAccessor:
                    var getAccessor = <GetAccessorSyntax>node;
                    return new NavigationBarItem(getAccessor.propertyName.text(), ScriptElementKind.memberGetAccessorElement, this.getKindModifiers(getAccessor.modifiers), [TextSpan.fromBounds(node.start(), node.end())]);

                case SyntaxKind.SetAccessor:
                    var setAccessor = <SetAccessorSyntax>node;
                    return new NavigationBarItem(setAccessor.propertyName.text(), ScriptElementKind.memberSetAccessorElement, this.getKindModifiers(setAccessor.modifiers), [TextSpan.fromBounds(node.start(), node.end())]);

                case SyntaxKind.IndexSignature:
                    var indexSignature = <IndexSignatureSyntax>node;
                    return new NavigationBarItem("[]", ScriptElementKind.indexSignatureElement, ScriptElementKindModifier.none, [TextSpan.fromBounds(node.start(), node.end())]);

                case SyntaxKind.EnumElement:
                    var enumElement = <EnumElementSyntax>node;
                    return new NavigationBarItem(enumElement.propertyName.text(), ScriptElementKind.memberVariableElement, ScriptElementKindModifier.none, [TextSpan.fromBounds(node.start(), node.end())]);

                case SyntaxKind.CallSignature:
                    var callSignature = <CallSignatureSyntax>node;
                    return new NavigationBarItem("()", ScriptElementKind.callSignatureElement, ScriptElementKindModifier.none, [TextSpan.fromBounds(node.start(), node.end())]);

                case SyntaxKind.ConstructSignature:
                    var constructSignature = <ConstructSignatureSyntax>node;
                    return new NavigationBarItem("new()", ScriptElementKind.constructSignatureElement, ScriptElementKindModifier.none, [TextSpan.fromBounds(node.start(), node.end())]);

                case SyntaxKind.MethodSignature:
                    var methodSignature = <MethodSignatureSyntax>node;
                    return new NavigationBarItem(methodSignature.propertyName.text(), ScriptElementKind.memberFunctionElement, ScriptElementKindModifier.none, [TextSpan.fromBounds(node.start(), node.end())]);

                case SyntaxKind.PropertySignature:
                    var propertySignature = <PropertySignatureSyntax>node;
                    return new NavigationBarItem(propertySignature.propertyName.text(), ScriptElementKind.memberVariableElement, ScriptElementKindModifier.none, [TextSpan.fromBounds(node.start(), node.end())]);

                case SyntaxKind.FunctionDeclaration:
                    var functionDeclaration = <FunctionDeclarationSyntax>node;
                    return new NavigationBarItem(functionDeclaration.identifier.text(), ScriptElementKind.functionElement, this.getKindModifiers(functionDeclaration.modifiers), [TextSpan.fromBounds(node.start(), node.end())]);

                case SyntaxKind.MemberVariableDeclaration:
                    var memberVariableDeclaration = <MemberVariableDeclarationSyntax>node;
                    return new NavigationBarItem(memberVariableDeclaration.variableDeclarator.propertyName.text(), ScriptElementKind.memberVariableElement, this.getKindModifiers(memberVariableDeclaration.modifiers), [TextSpan.fromBounds(memberVariableDeclaration.variableDeclarator.start(), memberVariableDeclaration.variableDeclarator.end())]);

                case SyntaxKind.VariableDeclarator:
                    var variableDeclarator = <VariableDeclaratorSyntax>node;
                    return new NavigationBarItem(variableDeclarator.propertyName.text(), ScriptElementKind.variableElement, ScriptElementKindModifier.none, [TextSpan.fromBounds(variableDeclarator.start(), variableDeclarator.end())]);

                case SyntaxKind.ConstructorDeclaration:
                    var constructorDeclaration = <ConstructorDeclarationSyntax>node;
                    return new NavigationBarItem("constructor", ScriptElementKind.constructorImplementationElement, ScriptElementKindModifier.none, [TextSpan.fromBounds(node.start(), node.end())]);
            }

            return null;
        }

        private createTopLevelItem(node: SyntaxNode): NavigationBarItem {
            switch (node.kind()) {
                case SyntaxKind.SourceUnit:
                    return this.createSourceUnitItem(<SourceUnitSyntax>node);

                case SyntaxKind.ClassDeclaration:
                    return this.createClassItem(<ClassDeclarationSyntax>node);

                case SyntaxKind.EnumDeclaration:
                    return this.createEnumItem(<EnumDeclarationSyntax>node);

                case SyntaxKind.InterfaceDeclaration:
                    return this.createIterfaceItem(<InterfaceDeclarationSyntax>node);

                case SyntaxKind.ModuleDeclaration:
                    return this.createModuleItem(<ModuleDeclarationSyntax>node);
            }

            return null;
        }
        
        private getModuleNames(node: TypeScript.ModuleDeclarationSyntax): string[] {
            var result: string[] = [];

            if (node.stringLiteral) {
                result.push(node.stringLiteral.text());
            }
            else {
                this.getModuleNamesHelper(node.name, result);
            }

            return result;
        }

        private getModuleNamesHelper(name: TypeScript.INameSyntax, result: string[]): void {
            if (name.kind() === TypeScript.SyntaxKind.QualifiedName) {
                var qualifiedName = <TypeScript.QualifiedNameSyntax>name;
                this.getModuleNamesHelper(qualifiedName.left, result);
                result.push(qualifiedName.right.text());
            }
            else {
                result.push((<TypeScript.ISyntaxToken>name).text());
            }
        }

        private createModuleItem(node: ModuleDeclarationSyntax): NavigationBarItem {
            var moduleNames = this.getModuleNames(node);

            var childItems = this.getItemsWorker(() => this.getChildNodes(node.moduleElements), n => this.createChildItem(n));

            return new NavigationBarItem(moduleNames.join("."),
                ScriptElementKind.moduleElement,
                this.getKindModifiers(node.modifiers),
                [TextSpan.fromBounds(node.start(), node.end())],
                childItems,
                this.getIndent(node));
        }

        private createSourceUnitItem(node: SourceUnitSyntax): NavigationBarItem {
            var childItems = this.getItemsWorker(() => this.getChildNodes(node.moduleElements), n => this.createChildItem(n));

            if (childItems === null || childItems.length === 0) {
                return null;
            }

            this.hasGlobalNode = true;
            return new NavigationBarItem("<global>",
                ScriptElementKind.moduleElement,
                ScriptElementKindModifier.none,
                [TextSpan.fromBounds(node.start(), node.end())],
                childItems);
        }

        private createClassItem(node: ClassDeclarationSyntax): NavigationBarItem {
            var nodes = <SyntaxNode[]>node.classElements.toArray();
            var constructor = <ConstructorDeclarationSyntax>ArrayUtilities.firstOrDefault(nodes, n => n.kind() === SyntaxKind.ConstructorDeclaration);

            // Add the constructor parameters in as children of hte class (for property parameters).
            if (constructor) {
                nodes.push.apply(nodes, constructor.callSignature.parameterList.parameters.toNonSeparatorArray());
            }

            var childItems = this.getItemsWorker(() => nodes, n => this.createChildItem(n));
            return new NavigationBarItem(
                node.identifier.text(),
                ScriptElementKind.classElement,
                this.getKindModifiers(node.modifiers),
                [TextSpan.fromBounds(node.start(), node.end())],
                childItems,
                this.getIndent(node));
        }

        private createEnumItem(node: TypeScript.EnumDeclarationSyntax): NavigationBarItem {
            var childItems = this.getItemsWorker(() => <SyntaxNode[]>node.enumElements.toArray(), n => this.createChildItem(n));
            return new NavigationBarItem(
                node.identifier.text(),
                ScriptElementKind.enumElement,
                this.getKindModifiers(node.modifiers),
                [TextSpan.fromBounds(node.start(), node.end())],
                childItems,
                this.getIndent(node));
        }

        private createIterfaceItem(node: TypeScript.InterfaceDeclarationSyntax): NavigationBarItem {
            var childItems = this.getItemsWorker(() => <SyntaxNode[]>node.body.typeMembers.toArray(), n => this.createChildItem(n));
            return new NavigationBarItem(
                node.identifier.text(),
                ScriptElementKind.interfaceElement,
                this.getKindModifiers(node.modifiers),
                [TextSpan.fromBounds(node.start(), node.end())],
                childItems,
                this.getIndent(node));
        }
    }
}
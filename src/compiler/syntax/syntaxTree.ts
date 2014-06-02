///<reference path='references.ts' />

module TypeScript {
    export var syntaxDiagnosticsTime: number = 0;

    export class SyntaxTree {
        private _isConcrete: boolean;
        private _sourceUnit: SourceUnitSyntax;
        private _isDeclaration: boolean;
        private _parserDiagnostics: Diagnostic[];
        private _allDiagnostics: Diagnostic[] = null;
        private _fileName: string;
        private _lineMap: LineMap;
        private _languageVersion: LanguageVersion;

        // Computed on demand.
        private _amdDependencies: string[];
        private _isExternalModule: boolean;

        constructor(isConcrete: boolean,
                    sourceUnit: SourceUnitSyntax,
                    isDeclaration: boolean,
                    diagnostics: Diagnostic[],
                    fileName: string,
                    public text: ISimpleText,
                    languageVersion: LanguageVersion) {
            this._isConcrete = isConcrete;
            this._sourceUnit = sourceUnit;
            this._isDeclaration = isDeclaration;
            this._parserDiagnostics = diagnostics;
            this._fileName = fileName;
            this._lineMap = text.lineMap();
            this._languageVersion = languageVersion;

            sourceUnit.syntaxTree = this;
        }

        public isConcrete(): boolean {
            return this._isConcrete;
        }

        public sourceUnit(): SourceUnitSyntax {
            return this._sourceUnit;
        }

        public isDeclaration(): boolean {
            return this._isDeclaration;
        }

        private computeDiagnostics(): Diagnostic[] {
            if (this._parserDiagnostics.length > 0) {
                return this._parserDiagnostics;
            }

            // No parser reported diagnostics.  Check for any additional grammar diagnostics.
            var diagnostics: Diagnostic[] = [];
            visitNodeOrToken(new GrammarCheckerWalker(this, diagnostics), this.sourceUnit());

            return diagnostics;
        }

        public diagnostics(): Diagnostic[] {
            if (this._allDiagnostics === null) {
                var start = new Date().getTime();
                this._allDiagnostics = this.computeDiagnostics();
                syntaxDiagnosticsTime += new Date().getTime() - start;
            }

            return this._allDiagnostics;
        }

        public fileName(): string {
            return this._fileName;
        }

        public lineMap(): LineMap {
            return this._lineMap;
        }

        public languageVersion(): LanguageVersion {
            return this._languageVersion;
        }

        private cacheSyntaxTreeInfo(): void {
            // If we're not keeping around the syntax tree, store the diagnostics and line
            // map so they don't have to be recomputed.
            var sourceUnit = this.sourceUnit();
            var firstToken = firstSyntaxTreeToken(this);
            var leadingTrivia = firstToken.leadingTrivia(this.text);

            this._isExternalModule = externalModuleIndicatorSpanWorker(this, firstToken) !== null;

            var amdDependencies: string[] = [];
            for (var i = 0, n = leadingTrivia.count(); i < n; i++) {
                var trivia = leadingTrivia.syntaxTriviaAt(i);
                if (trivia.isComment()) {
                    var amdDependency = this.getAmdDependency(trivia.fullText());
                    if (amdDependency) {
                        amdDependencies.push(amdDependency);
                    }
                }
            }

            this._amdDependencies = amdDependencies;
        }

        private getAmdDependency(comment: string): string {
            var amdDependencyRegEx = /^\/\/\/\s*<amd-dependency\s+path=('|")(.+?)\1/gim;
            var match = amdDependencyRegEx.exec(comment);
            return match ? match[2] : null;
        }

        public isExternalModule(): boolean {
            // October 11, 2013
            // External modules are written as separate source files that contain at least one 
            // external import declaration, export assignment, or top-level exported declaration.
            if (this._isExternalModule === undefined) {
                // force the info about isExternalModule to get created.
                this.cacheSyntaxTreeInfo();
                Debug.assert(this._isExternalModule !== undefined);
            }

            return this._isExternalModule;
        }

        public amdDependencies(): string[] {
            if (this._amdDependencies === undefined) {
                this.cacheSyntaxTreeInfo();
                Debug.assert(this._amdDependencies !== undefined);
            }

            return this._amdDependencies;
        }
    }

    class GrammarCheckerWalker extends SyntaxWalker {
        private inAmbientDeclaration: boolean = false;
        private inBlock: boolean = false;
        private inObjectLiteralExpression: boolean = false;
        private currentConstructor: ConstructorDeclarationSyntax = null;
        private text: ISimpleText;

        constructor(private syntaxTree: SyntaxTree,
                    private diagnostics: Diagnostic[]) {
            super();
            this.text = syntaxTree.text;
        }

        private pushDiagnostic(element: ISyntaxElement, diagnosticKey: string, args: any[] = null): void {
            this.diagnostics.push(new Diagnostic(
                this.syntaxTree.fileName(), this.syntaxTree.lineMap(), start(element, this.text), width(element), diagnosticKey, args));
        }

        public visitCatchClause(node: CatchClauseSyntax): void {
            if (node.typeAnnotation) {
                this.pushDiagnostic(node.typeAnnotation,
                    DiagnosticCode.Catch_clause_parameter_cannot_have_a_type_annotation);
            }

            super.visitCatchClause(node);
        }

        private checkParameterListOrder(node: ParameterListSyntax): boolean {
            var seenOptionalParameter = false;
            var parameterCount = node.parameters.length;

            for (var i = 0; i < parameterCount; i++) {
                var parameter = node.parameters[i];

                if (parameter.dotDotDotToken) {
                    if (i !== (parameterCount - 1)) {
                        this.pushDiagnostic(
                            parameter,
                            DiagnosticCode.A_rest_parameter_must_be_last_in_a_parameter_list);
                        return true;
                    }

                    if (parameter.questionToken) {
                        this.pushDiagnostic(
                            parameter,
                            DiagnosticCode.A_rest_parameter_cannot_be_optional);
                        return true;
                    }

                    if (parameter.equalsValueClause) {
                        this.pushDiagnostic(
                            parameter,
                            DiagnosticCode.A_rest_parameter_cannot_have_an_initializer);
                        return true;
                    }
                }
                else if (parameter.questionToken || parameter.equalsValueClause) {
                    seenOptionalParameter = true;

                    if (parameter.questionToken && parameter.equalsValueClause) {
                        this.pushDiagnostic(
                            parameter,
                            DiagnosticCode.Parameter_cannot_have_question_mark_and_initializer);
                        return true;
                    }
                }
                else {
                    if (seenOptionalParameter) {
                        this.pushDiagnostic(
                            parameter,
                            DiagnosticCode.A_required_parameter_cannot_follow_an_optional_parameter);
                        return true;
                    }
                }
            }

            return false;
        }

        private checkParameterListAcessibilityModifiers(node: ParameterListSyntax): boolean {
            for (var i = 0, n = node.parameters.length; i < n; i++) {
                var parameter = node.parameters[i];

                if (this.checkParameterAccessibilityModifiers(node, parameter)) {
                    return true;
                }
            }

            return false;
        }

        private checkParameterAccessibilityModifiers(parameterList: ParameterListSyntax, parameter: ParameterSyntax): boolean {
            if (parameter.modifiers.length > 0) {
                var modifiers = parameter.modifiers;

                for (var i = 0, n = modifiers.length; i < n; i++) {
                    var modifier = modifiers[i];

                    if (this.checkParameterAccessibilityModifier(parameterList, modifier, i)) {
                        return true;
                    }
                }
            }

            return false;
        }

        private checkParameterAccessibilityModifier(parameterList: ParameterListSyntax, modifier: ISyntaxToken, modifierIndex: number): boolean {
            if (modifier.kind() !== SyntaxKind.PublicKeyword && modifier.kind() !== SyntaxKind.PrivateKeyword) {
                this.pushDiagnostic(modifier,
                    DiagnosticCode._0_modifier_cannot_appear_on_a_parameter, [modifier.text()]);
                return true;
            }
            else {
                if (modifierIndex > 0) {
                    this.pushDiagnostic(modifier, DiagnosticCode.Accessibility_modifier_already_seen);
                    return true;
                }

                if (!this.inAmbientDeclaration && this.currentConstructor && !this.currentConstructor.block && this.currentConstructor.callSignature.parameterList === parameterList) {
                    this.pushDiagnostic(modifier,
                        DiagnosticCode.A_parameter_property_is_only_allowed_in_a_constructor_implementation);
                    return true;
                }
                else if (this.inAmbientDeclaration || this.currentConstructor === null || this.currentConstructor.callSignature.parameterList !== parameterList) {
                    this.pushDiagnostic(modifier,
                        DiagnosticCode.A_parameter_property_is_only_allowed_in_a_constructor_implementation);
                    return true;
                }
            }

            return false;
        }

        private checkForTrailingSeparator(list: ISyntaxNodeOrToken[]): boolean {
            // If we have at least one child, and we have an even number of children, then that 
            // means we have an illegal trailing separator.
            if (childCount(list) === 0 || childCount(list) % 2 === 1) {
                return false;
            }

            var child = childAt(list, childCount(list) - 1);
            this.pushDiagnostic(child, DiagnosticCode.Trailing_separator_not_allowed);

            return true;
        }

        private checkForAtLeastOneElement(parent: ISyntaxElement, list: ISyntaxNodeOrToken[], reportToken: ISyntaxToken, listKind: string): boolean {
            if (childCount(list) > 0) {
                return false;
            }


            this.pushDiagnostic(reportToken, DiagnosticCode._0_list_cannot_be_empty, [listKind]);

            return true;
        }

        public visitParameterList(node: ParameterListSyntax): void {
            if (this.checkParameterListAcessibilityModifiers(node) ||
                this.checkParameterListOrder(node) ||
                this.checkForTrailingSeparator(node.parameters)) {

                return;
            }

            super.visitParameterList(node);
        }

        public visitHeritageClause(node: HeritageClauseSyntax): void {
            if (this.checkForTrailingSeparator(node.typeNames) ||
                this.checkForAtLeastOneElement(node, node.typeNames, node.extendsOrImplementsKeyword, SyntaxFacts.getText(node.extendsOrImplementsKeyword.kind()))) {
                return;
            }

            super.visitHeritageClause(node);
        }

        public visitArgumentList(node: ArgumentListSyntax): void {
            if (this.checkForTrailingSeparator(node.arguments)) {
                return;
            }

            super.visitArgumentList(node);
        }

        public visitVariableDeclaration(node: VariableDeclarationSyntax): void {
            if (this.checkForAtLeastOneElement(node, node.variableDeclarators, node.varKeyword, getLocalizedText(DiagnosticCode.variable_declaration, null)) ||
                this.checkForTrailingSeparator(node.variableDeclarators)) {
                return;
            }

            super.visitVariableDeclaration(node);
        }

        public visitTypeArgumentList(node: TypeArgumentListSyntax): void {
            if (this.checkForTrailingSeparator(node.typeArguments) ||
                this.checkForAtLeastOneElement(node, node.typeArguments, node.lessThanToken, getLocalizedText(DiagnosticCode.type_argument, null))) {
                return;
            }

            super.visitTypeArgumentList(node);
        }

        public visitTypeParameterList(node: TypeParameterListSyntax): void {
            if (this.checkForTrailingSeparator(node.typeParameters) ||
                this.checkForAtLeastOneElement(node, node.typeParameters, node.lessThanToken, getLocalizedText(DiagnosticCode.type_parameter, null))) {
                return;
            }

            super.visitTypeParameterList(node);
        }

        private checkIndexSignatureParameter(node: IndexSignatureSyntax): boolean {
            if (node.parameters.length !== 1) {
                this.pushDiagnostic(node.openBracketToken, DiagnosticCode.Index_signature_must_have_exactly_one_parameter);
                return true;
            }

            var parameter = node.parameters[0];

            if (parameter.dotDotDotToken) {
                this.pushDiagnostic(parameter, DiagnosticCode.Index_signatures_cannot_have_rest_parameters);
                return true;
            }
            else if (parameter.modifiers.length > 0) {
                this.pushDiagnostic(parameter, DiagnosticCode.Index_signature_parameter_cannot_have_accessibility_modifiers);
                return true;
            }
            else if (parameter.questionToken) {
                this.pushDiagnostic(parameter, DiagnosticCode.Index_signature_parameter_cannot_have_a_question_mark);
                return true;
            }
            else if (parameter.equalsValueClause) {
                this.pushDiagnostic(parameter, DiagnosticCode.Index_signature_parameter_cannot_have_an_initializer);
                return true;
            }
            else if (!parameter.typeAnnotation) {
                this.pushDiagnostic(parameter, DiagnosticCode.Index_signature_parameter_must_have_a_type_annotation);
                return true;
            }
            else if (parameter.typeAnnotation.type.kind() !== SyntaxKind.StringKeyword &&
                     parameter.typeAnnotation.type.kind() !== SyntaxKind.NumberKeyword) {
                this.pushDiagnostic(parameter, DiagnosticCode.Index_signature_parameter_type_must_be_string_or_number);
                return true;
            }

            return false;
        }

        public visitIndexSignature(node: IndexSignatureSyntax): void {
            if (this.checkIndexSignatureParameter(node)) {
                return;
            }

            if (!node.typeAnnotation) {
                this.pushDiagnostic(node, DiagnosticCode.Index_signature_must_have_a_type_annotation);
                return;
            }

            super.visitIndexSignature(node);
        }

        private checkClassDeclarationHeritageClauses(node: ClassDeclarationSyntax): boolean {
            var seenExtendsClause = false;
            var seenImplementsClause = false;

            for (var i = 0, n = node.heritageClauses.length; i < n; i++) {
                Debug.assert(i <= 2);
                var heritageClause = node.heritageClauses[i];

                if (heritageClause.extendsOrImplementsKeyword.kind() === SyntaxKind.ExtendsKeyword) {
                    if (seenExtendsClause) {
                        this.pushDiagnostic(heritageClause,
                            DiagnosticCode.extends_clause_already_seen);
                        return true;
                    }

                    if (seenImplementsClause) {
                        this.pushDiagnostic(heritageClause,
                            DiagnosticCode.extends_clause_must_precede_implements_clause);
                        return true;
                    }

                    if (heritageClause.typeNames.length > 1) {
                        this.pushDiagnostic(heritageClause,
                            DiagnosticCode.Classes_can_only_extend_a_single_class);
                        return true;
                    }

                    seenExtendsClause = true;
                }
                else {
                    Debug.assert(heritageClause.extendsOrImplementsKeyword.kind() === SyntaxKind.ImplementsKeyword);
                    if (seenImplementsClause) {
                        this.pushDiagnostic(heritageClause,
                            DiagnosticCode.implements_clause_already_seen);
                        return true;
                    }

                    seenImplementsClause = true;
                }
            }

            return false;
        }

        private checkForDisallowedDeclareModifier(modifiers: ISyntaxToken[]): boolean {
            if (this.inAmbientDeclaration) {
                // If we're already in an ambient declaration, then 'declare' is not allowed.
                var declareToken = SyntaxUtilities.getToken(modifiers, SyntaxKind.DeclareKeyword);

                if (declareToken) {
                    this.pushDiagnostic(declareToken,
                        DiagnosticCode.A_declare_modifier_cannot_be_used_in_an_already_ambient_context);
                    return true;
                }
            }

            return false;
        }

        private checkForRequiredDeclareModifier(moduleElement: IModuleElementSyntax, reportToken: ISyntaxToken, modifiers: ISyntaxToken[]): boolean {
            if (!this.inAmbientDeclaration && this.syntaxTree.isDeclaration()) {
                // We're at the top level in a declaration file, a 'declare' modifiers is required
                // on most module elements.
                if (!SyntaxUtilities.containsToken(modifiers, SyntaxKind.DeclareKeyword)) {
                    this.pushDiagnostic(reportToken, DiagnosticCode.A_declare_modifier_is_required_for_a_top_level_declaration_in_a_d_ts_file);
                    return true;
                }
            }
        }

        private checkClassOverloads(node: ClassDeclarationSyntax): boolean {
            if (!this.inAmbientDeclaration && !SyntaxUtilities.containsToken(node.modifiers, SyntaxKind.DeclareKeyword)) {
                var inFunctionOverloadChain = false;
                var inConstructorOverloadChain = false;

                var functionOverloadChainName: string = null;
                var isInStaticOverloadChain: boolean = null;
                var memberFunctionDeclaration: MemberFunctionDeclarationSyntax = null;

                for (var i = 0, n = node.classElements.length; i < n; i++) {
                    var classElement = node.classElements[i];
                    var lastElement = i === (n - 1);
                    var isStaticOverload: boolean = null;

                    if (inFunctionOverloadChain) {
                        if (classElement.kind() !== SyntaxKind.MemberFunctionDeclaration) {
                            this.pushDiagnostic(firstToken(classElement), DiagnosticCode.Function_implementation_expected);
                            return true;
                        }

                        memberFunctionDeclaration = <MemberFunctionDeclarationSyntax>classElement;
                        if (tokenValueText(memberFunctionDeclaration.propertyName) !== functionOverloadChainName) {
                            this.pushDiagnostic(memberFunctionDeclaration.propertyName,
                                DiagnosticCode.Function_overload_name_must_be_0, [functionOverloadChainName]);
                            return true;
                        }

                        isStaticOverload = SyntaxUtilities.containsToken(memberFunctionDeclaration.modifiers, SyntaxKind.StaticKeyword);
                        if (isStaticOverload !== isInStaticOverloadChain) {
                            var diagnostic = isInStaticOverloadChain ? DiagnosticCode.Function_overload_must_be_static : DiagnosticCode.Function_overload_must_not_be_static;
                            this.pushDiagnostic(memberFunctionDeclaration.propertyName, diagnostic);
                            return true;
                        }
                    }
                    else if (inConstructorOverloadChain) {
                        if (classElement.kind() !== SyntaxKind.ConstructorDeclaration) {
                            this.pushDiagnostic(firstToken(classElement), DiagnosticCode.Constructor_implementation_expected);
                            return true;
                        }
                    }

                    if (classElement.kind() === SyntaxKind.MemberFunctionDeclaration) {
                        memberFunctionDeclaration = <MemberFunctionDeclarationSyntax>classElement;

                        inFunctionOverloadChain = memberFunctionDeclaration.block === null;
                        functionOverloadChainName = tokenValueText(memberFunctionDeclaration.propertyName);
                        isInStaticOverloadChain = SyntaxUtilities.containsToken(memberFunctionDeclaration.modifiers, SyntaxKind.StaticKeyword);

                        if (inFunctionOverloadChain) {
                            if (lastElement) {
                                this.pushDiagnostic(firstToken(classElement), DiagnosticCode.Function_implementation_expected);
                                return true;
                            }
                            else {
                                // We're a function without a body, and there's another element 
                                // after us.  If it's another overload that doesn't have a body,
                                // then report an error that we're missing an implementation here.

                                var nextElement = childAt(node.classElements, i + 1);
                            if (nextElement.kind() === SyntaxKind.MemberFunctionDeclaration) {
                                    var nextMemberFunction = <MemberFunctionDeclarationSyntax>nextElement;

                                    if (tokenValueText(nextMemberFunction.propertyName) !== functionOverloadChainName &&
                                        nextMemberFunction.block === null) {

                                        this.pushDiagnostic(memberFunctionDeclaration.propertyName, DiagnosticCode.Function_implementation_expected);
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    else if (classElement.kind() === SyntaxKind.ConstructorDeclaration) {
                        var constructorDeclaration = <ConstructorDeclarationSyntax>classElement;

                        inConstructorOverloadChain = constructorDeclaration.block === null;
                        if (lastElement && inConstructorOverloadChain) {
                            this.pushDiagnostic(firstToken(classElement), DiagnosticCode.Constructor_implementation_expected);
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        private checkForReservedName(parent: ISyntaxElement, name: ISyntaxToken, diagnosticKey: string): boolean {
            switch (tokenValueText(name)) {
                case "any":
                case "number":
                case "boolean":
                case "string":
                case "void":
                    this.pushDiagnostic(name, diagnosticKey, [tokenValueText(name)]);
                    return true;
            }

            return false;
        }

        public visitClassDeclaration(node: ClassDeclarationSyntax): void {
            if (this.checkForReservedName(node, node.identifier, DiagnosticCode.Class_name_cannot_be_0) ||
                this.checkForDisallowedDeclareModifier(node.modifiers) ||
                this.checkForRequiredDeclareModifier(node, node.identifier, node.modifiers) ||
                this.checkModuleElementModifiers(node.modifiers) ||
                this.checkClassDeclarationHeritageClauses(node) ||
                this.checkClassOverloads(node)) {

                return;
            }

            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = this.inAmbientDeclaration || this.syntaxTree.isDeclaration() || SyntaxUtilities.containsToken(node.modifiers, SyntaxKind.DeclareKeyword);
            super.visitClassDeclaration(node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        }

        private checkInterfaceDeclarationHeritageClauses(node: InterfaceDeclarationSyntax): boolean {
            var seenExtendsClause = false;

            for (var i = 0, n = node.heritageClauses.length; i < n; i++) {
                Debug.assert(i <= 1);
                var heritageClause = node.heritageClauses[i];

                if (heritageClause.extendsOrImplementsKeyword.kind() === SyntaxKind.ExtendsKeyword) {
                    if (seenExtendsClause) {
                        this.pushDiagnostic(heritageClause,
                            DiagnosticCode.extends_clause_already_seen);
                        return true;
                    }

                    seenExtendsClause = true;
                }
                else {
                    Debug.assert(heritageClause.extendsOrImplementsKeyword.kind() === SyntaxKind.ImplementsKeyword);
                    this.pushDiagnostic(heritageClause,
                        DiagnosticCode.Interface_declaration_cannot_have_implements_clause);
                    return true;
                }
            }

            return false;
        }

        private checkInterfaceModifiers(modifiers: ISyntaxToken[]): boolean {
            for (var i = 0, n = modifiers.length; i < n; i++) {
                var modifier = modifiers[i];
                if (modifier.kind() === SyntaxKind.DeclareKeyword) {
                    this.pushDiagnostic(modifier,
                        DiagnosticCode.A_declare_modifier_cannot_be_used_with_an_interface_declaration);
                    return true;
                }
            }

            return false;
        }

        public visitInterfaceDeclaration(node: InterfaceDeclarationSyntax): void {
            if (this.checkForReservedName(node, node.identifier, DiagnosticCode.Interface_name_cannot_be_0) ||
                this.checkInterfaceModifiers(node.modifiers) ||
                this.checkModuleElementModifiers(node.modifiers) ||
                this.checkInterfaceDeclarationHeritageClauses(node)) {

                return;
            }

            super.visitInterfaceDeclaration(node);
        }

        private checkClassElementModifiers(list: ISyntaxToken[]): boolean {
            var seenAccessibilityModifier = false;
            var seenStaticModifier = false;

            for (var i = 0, n = list.length; i < n; i++) {
                var modifier = list[i];
                if (modifier.kind() === SyntaxKind.PublicKeyword ||
                    modifier.kind() === SyntaxKind.PrivateKeyword) {

                    if (seenAccessibilityModifier) {
                        this.pushDiagnostic(modifier,
                            DiagnosticCode.Accessibility_modifier_already_seen);
                        return true;
                    }

                    if (seenStaticModifier) {
                        var previousToken = list[i - 1];
                        this.pushDiagnostic(modifier,
                            DiagnosticCode._0_modifier_must_precede_1_modifier, [modifier.text(), previousToken.text()]);
                        return true;
                    }

                    seenAccessibilityModifier = true;
                }
                else if (modifier.kind() === SyntaxKind.StaticKeyword) {
                    if (seenStaticModifier) {
                        this.pushDiagnostic(modifier,
                            DiagnosticCode._0_modifier_already_seen, [modifier.text()]);
                        return true;
                    }

                    seenStaticModifier = true;
                }
                else {
                    this.pushDiagnostic(modifier,
                        DiagnosticCode._0_modifier_cannot_appear_on_a_class_element, [modifier.text()]);
                    return true;
                }
            }

            return false;
        }

        public visitMemberVariableDeclaration(node: MemberVariableDeclarationSyntax): void {
            if (this.checkClassElementModifiers(node.modifiers)) {
                return;
            }

            super.visitMemberVariableDeclaration(node);
        }

        public visitMemberFunctionDeclaration(node: MemberFunctionDeclarationSyntax): void {
            if (this.checkClassElementModifiers(node.modifiers)) {
                return;
            }

            super.visitMemberFunctionDeclaration(node);
        }

        private checkGetAccessorParameter(node: GetAccessorSyntax): boolean {
            if (node.callSignature.parameterList.parameters.length !== 0) {
                this.pushDiagnostic(node.propertyName, DiagnosticCode.get_accessor_cannot_have_parameters);
                return true;
            }

            return false;
        }

        public visitIndexMemberDeclaration(node: IndexMemberDeclarationSyntax): void {
            if (this.checkIndexMemberModifiers(node)) {
                return;
            }

            super.visitIndexMemberDeclaration(node);
        }

        private checkIndexMemberModifiers(node: IndexMemberDeclarationSyntax): boolean {
            if (node.modifiers.length > 0) {
                this.pushDiagnostic(childAt(node.modifiers, 0), DiagnosticCode.Modifiers_cannot_appear_here);
                return true;
            }

            return false;
        }

        private checkEcmaScriptVersionIsAtLeast(parent: ISyntaxElement, reportToken: ISyntaxToken, languageVersion: LanguageVersion, diagnosticKey: string): boolean {
            if (this.syntaxTree.languageVersion() < languageVersion) {
                this.pushDiagnostic(reportToken, diagnosticKey);
                return true;
            }

            return false;
        }

        public visitObjectLiteralExpression(node: ObjectLiteralExpressionSyntax): void {
            var savedInObjectLiteralExpression = this.inObjectLiteralExpression;
            this.inObjectLiteralExpression = true;
            super.visitObjectLiteralExpression(node);
            this.inObjectLiteralExpression = savedInObjectLiteralExpression;
        }

        public visitGetAccessor(node: GetAccessorSyntax): void {
            if (this.checkForAccessorDeclarationInAmbientContext(node) ||
                this.checkEcmaScriptVersionIsAtLeast(node, node.propertyName, LanguageVersion.EcmaScript5, DiagnosticCode.Accessors_are_only_available_when_targeting_ECMAScript_5_and_higher) ||
                this.checkForDisallowedModifiers(node, node.modifiers) ||
                this.checkClassElementModifiers(node.modifiers) ||
                this.checkForDisallowedAccessorTypeParameters(node.callSignature) ||
                this.checkGetAccessorParameter(node)) {
                return;
            }

            super.visitGetAccessor(node);
        }

        private checkForDisallowedSetAccessorTypeAnnotation(accessor: SetAccessorSyntax): boolean {
            if (accessor.callSignature.typeAnnotation) {
                this.pushDiagnostic(accessor.callSignature.typeAnnotation, DiagnosticCode.Type_annotation_cannot_appear_on_a_set_accessor);
                return true;
            }

            return false;
        }

        private checkForDisallowedAccessorTypeParameters(callSignature: CallSignatureSyntax): boolean {
            if (callSignature.typeParameterList !== null) {
                this.pushDiagnostic(callSignature.typeParameterList, DiagnosticCode.Type_parameters_cannot_appear_on_an_accessor);
                return true;
            }

            return false;
        }

        private checkForAccessorDeclarationInAmbientContext(accessor: ISyntaxNode): boolean {
            if (this.inAmbientDeclaration) {
                this.pushDiagnostic(accessor, DiagnosticCode.Accessors_are_not_allowed_in_ambient_contexts);
                return true;
            }

            return false;
        }

        private checkSetAccessorParameter(node: SetAccessorSyntax): boolean {
            var parameters = node.callSignature.parameterList.parameters;
            if (childCount(parameters) !== 1) {
                this.pushDiagnostic(node.propertyName, DiagnosticCode.set_accessor_must_have_exactly_one_parameter);
                return true;
            }

            var parameter = parameters[0];

            if (parameter.questionToken) {
                this.pushDiagnostic(parameter,
                    DiagnosticCode.set_accessor_parameter_cannot_be_optional);
                return true;
            }

            if (parameter.equalsValueClause) {
                this.pushDiagnostic(parameter,
                    DiagnosticCode.set_accessor_parameter_cannot_have_an_initializer);
                return true;
            }

            if (parameter.dotDotDotToken) {
                this.pushDiagnostic(parameter,
                    DiagnosticCode.set_accessor_cannot_have_rest_parameter);
                return true;
            }

            return false;
        }

        public visitSetAccessor(node: SetAccessorSyntax): void {
            if (this.checkForAccessorDeclarationInAmbientContext(node) ||
                this.checkEcmaScriptVersionIsAtLeast(node, node.propertyName, LanguageVersion.EcmaScript5, DiagnosticCode.Accessors_are_only_available_when_targeting_ECMAScript_5_and_higher) ||
                this.checkForDisallowedModifiers(node, node.modifiers) ||
                this.checkClassElementModifiers(node.modifiers) ||
                this.checkForDisallowedAccessorTypeParameters(node.callSignature) ||
                this.checkForDisallowedSetAccessorTypeAnnotation(node) ||
                this.checkSetAccessorParameter(node)) {
                return;
            }

            super.visitSetAccessor(node);
        }

        public visitEnumDeclaration(node: EnumDeclarationSyntax): void {
            if (this.checkForReservedName(node, node.identifier, DiagnosticCode.Enum_name_cannot_be_0) ||
                this.checkForDisallowedDeclareModifier(node.modifiers) ||
                this.checkForRequiredDeclareModifier(node, node.identifier, node.modifiers) ||
                this.checkModuleElementModifiers(node.modifiers),
                this.checkEnumElements(node)) {

                return;
            }

            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = this.inAmbientDeclaration || this.syntaxTree.isDeclaration() || SyntaxUtilities.containsToken(node.modifiers, SyntaxKind.DeclareKeyword);
            super.visitEnumDeclaration(node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        }

        private checkEnumElements(node: EnumDeclarationSyntax): boolean {
            var previousValueWasComputed = false;
            for (var i = 0, n = childCount(node.enumElements); i < n; i++) {
                var child = childAt(node.enumElements, i);

                if (i % 2 === 0) {
                    var enumElement = <EnumElementSyntax>child;

                    if (!enumElement.equalsValueClause && previousValueWasComputed) {
                        this.pushDiagnostic(enumElement, DiagnosticCode.Enum_member_must_have_initializer);
                        return true;
                    }

                    if (enumElement.equalsValueClause) {
                        var value = enumElement.equalsValueClause.value;
                        previousValueWasComputed = !Syntax.isIntegerLiteral(value);
                    }
                }
            }

            return false;
        }

        public visitEnumElement(node: EnumElementSyntax): void {
            if (this.inAmbientDeclaration && node.equalsValueClause) {
                var expression = node.equalsValueClause.value;
                if (!Syntax.isIntegerLiteral(expression)) {
                    this.pushDiagnostic(node.equalsValueClause.value, DiagnosticCode.Ambient_enum_elements_can_only_have_integer_literal_initializers);
                    return;
                }
            }

            super.visitEnumElement(node);
        }

        public visitInvocationExpression(node: InvocationExpressionSyntax): void {
            if (node.expression.kind() === SyntaxKind.SuperKeyword &&
                node.argumentList.typeArgumentList !== null) {
                this.pushDiagnostic(node,
                    DiagnosticCode.super_invocation_cannot_have_type_arguments);
            }

            super.visitInvocationExpression(node);
        }

        private checkModuleElementModifiers(modifiers: ISyntaxToken[]): boolean {
            var seenExportModifier = false;
            var seenDeclareModifier = false;

            for (var i = 0, n = modifiers.length; i < n; i++) {
                var modifier = modifiers[i];
                if (modifier.kind() === SyntaxKind.PublicKeyword ||
                    modifier.kind() === SyntaxKind.PrivateKeyword ||
                    modifier.kind() === SyntaxKind.StaticKeyword) {
                    this.pushDiagnostic(modifier,
                        DiagnosticCode._0_modifier_cannot_appear_on_a_module_element, [modifier.text()]);
                    return true;
                }

                if (modifier.kind() === SyntaxKind.DeclareKeyword) {
                    if (seenDeclareModifier) {
                        this.pushDiagnostic(modifier,
                            DiagnosticCode.Accessibility_modifier_already_seen);
                        return;
                    }

                    seenDeclareModifier = true;
                }
                else if (modifier.kind() === SyntaxKind.ExportKeyword) {
                    if (seenExportModifier) {
                        this.pushDiagnostic(modifier,
                            DiagnosticCode._0_modifier_already_seen, [modifier.text()]);
                        return;
                    }

                    if (seenDeclareModifier) {
                        this.pushDiagnostic(modifier,
                            DiagnosticCode._0_modifier_must_precede_1_modifier,
                            [SyntaxFacts.getText(SyntaxKind.ExportKeyword), SyntaxFacts.getText(SyntaxKind.DeclareKeyword)]);
                        return;
                    }

                    seenExportModifier = true;
                }
            }

            return false;
        }

        private checkForDisallowedImportDeclaration(node: ModuleDeclarationSyntax): boolean {
            for (var i = 0, n = node.moduleElements.length; i < n; i++) {
                var child = node.moduleElements[i];
                if (child.kind() === SyntaxKind.ImportDeclaration) {
                    var importDeclaration = <ImportDeclarationSyntax>child;
                    if (importDeclaration.moduleReference.kind() === SyntaxKind.ExternalModuleReference) {
                        if (node.stringLiteral === null) {
                            this.pushDiagnostic(importDeclaration, DiagnosticCode.Import_declarations_in_an_internal_module_cannot_reference_an_external_module);
                        }
                    }
                }
            }

            return false;
        }

        private checkForDisallowedDeclareModifierOnImportDeclaration(modifiers: ISyntaxToken[]): boolean {
            var declareToken = SyntaxUtilities.getToken(modifiers, SyntaxKind.DeclareKeyword);

            if (declareToken) {
                this.pushDiagnostic(declareToken,
                    DiagnosticCode.A_declare_modifier_cannot_be_used_with_an_import_declaration);
                return true;
            }
        }

        public visitImportDeclaration(node: ImportDeclarationSyntax): any {
            if (this.checkForDisallowedDeclareModifierOnImportDeclaration(node.modifiers) ||
                this.checkModuleElementModifiers(node.modifiers)) {
                return;
            }

            super.visitImportDeclaration(node);
        }

        public visitModuleDeclaration(node: ModuleDeclarationSyntax): void {
            if (this.checkForDisallowedDeclareModifier(node.modifiers) ||
                this.checkForRequiredDeclareModifier(node, node.stringLiteral ? node.stringLiteral : firstToken(node.name), node.modifiers) ||
                this.checkModuleElementModifiers(node.modifiers) ||
                this.checkForDisallowedImportDeclaration(node) ||
                this.checkForDisallowedExports(node, node.moduleElements) ||
                this.checkForMultipleExportAssignments(node, node.moduleElements)) {

                return;
            }

            if (node.stringLiteral) {
                if (!this.inAmbientDeclaration && !SyntaxUtilities.containsToken(node.modifiers, SyntaxKind.DeclareKeyword)) {
                    this.pushDiagnostic(node.stringLiteral,
                        DiagnosticCode.Only_ambient_modules_can_use_quoted_names);
                    return;
                }
            }

            if (!node.stringLiteral &&
                this.checkForDisallowedExportAssignment(node)) {

                return;
            }

            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = this.inAmbientDeclaration || this.syntaxTree.isDeclaration() || SyntaxUtilities.containsToken(node.modifiers, SyntaxKind.DeclareKeyword);
            super.visitModuleDeclaration(node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        }

        private checkForDisallowedExports(node: ISyntaxElement, moduleElements: IModuleElementSyntax[]): boolean {
            var seenExportedElement = false;
            for (var i = 0, n = moduleElements.length; i < n; i++) {
                var child = moduleElements[i];

                if (SyntaxUtilities.hasExportKeyword(child)) {
                    seenExportedElement = true;
                    break;
                }
            }

            if (seenExportedElement) {
                for (var i = 0, n = moduleElements.length; i < n; i++) {
                    var child = moduleElements[i];

                    if (child.kind() === SyntaxKind.ExportAssignment) {
                        this.pushDiagnostic(child, DiagnosticCode.Export_assignment_not_allowed_in_module_with_exported_element);
                        return true;
                    }
                }
            }

            return false;
        }

        private checkForMultipleExportAssignments(node: ISyntaxElement, moduleElements: IModuleElementSyntax[]): boolean {
            var seenExportAssignment = false;
            var errorFound = false;
            for (var i = 0, n = moduleElements.length; i < n; i++) {
                var child = moduleElements[i];
                if (child.kind() === SyntaxKind.ExportAssignment) {
                    if (seenExportAssignment) {
                        this.pushDiagnostic(child, DiagnosticCode.A_module_cannot_have_multiple_export_assignments);
                        errorFound = true;
                    }
                    seenExportAssignment = true;
                }
            }

            return errorFound;
        }

        private checkForDisallowedExportAssignment(node: ModuleDeclarationSyntax): boolean {
            for (var i = 0, n = node.moduleElements.length; i < n; i++) {
                var child = node.moduleElements[i];

                if (child.kind() === SyntaxKind.ExportAssignment) {
                    this.pushDiagnostic(child, DiagnosticCode.Export_assignment_cannot_be_used_in_internal_modules);

                    return true;
                }
            }

            return false;
        }

        public visitBlock(node: BlockSyntax): void {
            if (this.inAmbientDeclaration || this.syntaxTree.isDeclaration()) {
                this.pushDiagnostic(node.openBraceToken, DiagnosticCode.A_function_implementation_cannot_be_declared_in_an_ambient_context);
                return;
            }

            var savedInBlock = this.inBlock;
            this.inBlock = true;
            super.visitBlock(node);
            this.inBlock = savedInBlock;
        }

        private checkForStatementInAmbientContxt(node: IStatementSyntax): boolean {
            if (this.inAmbientDeclaration || this.syntaxTree.isDeclaration()) {
                this.pushDiagnostic(firstToken(node), DiagnosticCode.Statements_are_not_allowed_in_ambient_contexts);
                return true;
            }

            return false;
        }

        public visitBreakStatement(node: BreakStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitBreakStatement(node);
        }

        public visitContinueStatement(node: ContinueStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitContinueStatement(node);
        }

        public visitDebuggerStatement(node: DebuggerStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitDebuggerStatement(node);
        }

        public visitDoStatement(node: DoStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitDoStatement(node);
        }

        public visitEmptyStatement(node: EmptyStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitEmptyStatement(node);
        }

        public visitExpressionStatement(node: ExpressionStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitExpressionStatement(node);
        }

        public visitForInStatement(node: ForInStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node) ||
                this.checkForInStatementVariableDeclaration(node)) {

                return;
            }

            super.visitForInStatement(node);
        }

        private checkForInStatementVariableDeclaration(node: ForInStatementSyntax): boolean {
            // The parser accepts a Variable Declaration in a ForInStatement, but the grammar only
            // allows a very restricted form.  Specifically, there must be only a single Variable
            // Declarator in the Declaration.
            if (node.variableDeclaration && node.variableDeclaration.variableDeclarators.length > 1) {
                this.pushDiagnostic(node.variableDeclaration, DiagnosticCode.Only_a_single_variable_declaration_is_allowed_in_a_for_in_statement);
                return true;
            }

            return false;
        }

        public visitForStatement(node: ForStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitForStatement(node);
        }

        public visitIfStatement(node: IfStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitIfStatement(node);
        }

        public visitLabeledStatement(node: LabeledStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitLabeledStatement(node);
        }

        public visitReturnStatement(node: ReturnStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitReturnStatement(node);
        }

        public visitSwitchStatement(node: SwitchStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitSwitchStatement(node);
        }

        public visitThrowStatement(node: ThrowStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitThrowStatement(node);
        }

        public visitTryStatement(node: TryStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitTryStatement(node);
        }

        public visitWhileStatement(node: WhileStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitWhileStatement(node);
        }

        public visitWithStatement(node: WithStatementSyntax): void {
            if (this.checkForStatementInAmbientContxt(node)) {
                return;
            }

            super.visitWithStatement(node);
        }

        private checkForDisallowedModifiers(parent: ISyntaxElement, modifiers: ISyntaxToken[]): boolean {
            if (this.inBlock || this.inObjectLiteralExpression) {
                if (modifiers.length > 0) {
                    this.pushDiagnostic(childAt(modifiers, 0), DiagnosticCode.Modifiers_cannot_appear_here);
                    return true;
                }
            }

            return false;
        }

        public visitFunctionDeclaration(node: FunctionDeclarationSyntax): void {
            if (this.checkForDisallowedDeclareModifier(node.modifiers) ||
                this.checkForDisallowedModifiers(node, node.modifiers) ||
                this.checkForRequiredDeclareModifier(node, node.identifier, node.modifiers) ||
                this.checkModuleElementModifiers(node.modifiers)) {

                return;
            }

            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = this.inAmbientDeclaration || this.syntaxTree.isDeclaration() || SyntaxUtilities.containsToken(node.modifiers, SyntaxKind.DeclareKeyword);
            super.visitFunctionDeclaration(node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        }

        public visitVariableStatement(node: VariableStatementSyntax): void {
            if (this.checkForDisallowedDeclareModifier(node.modifiers) ||
                this.checkForDisallowedModifiers(node, node.modifiers) ||
                this.checkForRequiredDeclareModifier(node, node.variableDeclaration.varKeyword, node.modifiers) ||
                this.checkModuleElementModifiers(node.modifiers)) {

                return;
            }

            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = this.inAmbientDeclaration || this.syntaxTree.isDeclaration() || SyntaxUtilities.containsToken(node.modifiers, SyntaxKind.DeclareKeyword);
            super.visitVariableStatement(node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        }

        private checkListSeparators<T extends ISyntaxNodeOrToken>(parent: ISyntaxElement, list: T[], kind: SyntaxKind): boolean {
            for (var i = 0, n = childCount(list); i < n; i++) {
                var child = childAt(list, i);
                if (i % 2 === 1 && child.kind() !== kind) {
                    this.pushDiagnostic(child, DiagnosticCode._0_expected, [SyntaxFacts.getText(kind)]);
                }
            }

            return false;
        }

        public visitObjectType(node: ObjectTypeSyntax): void {
            if (this.checkListSeparators(node, node.typeMembers, SyntaxKind.SemicolonToken)) {
                return;
            }

            // All code in an object type is implicitly ambient. (i.e. parameters can't have initializer, etc.)
            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = true;
            super.visitObjectType(node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        }

        public visitArrayType(node: ArrayTypeSyntax): void {
            // All code in an object type is implicitly ambient. (i.e. parameters can't have initializer, etc.)
            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = true;
            super.visitArrayType(node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        }

        public visitFunctionType(node: FunctionTypeSyntax): void {
            // All code in an object type is implicitly ambient. (i.e. parameters can't have initializer, etc.)
            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = true;
            super.visitFunctionType(node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        }

        public visitConstructorType(node: ConstructorTypeSyntax): void {
            // All code in an object type is implicitly ambient. (i.e. parameters can't have initializer, etc.)
            var savedInAmbientDeclaration = this.inAmbientDeclaration;
            this.inAmbientDeclaration = true;
            super.visitConstructorType(node);
            this.inAmbientDeclaration = savedInAmbientDeclaration;
        }

        public visitVariableDeclarator(node: VariableDeclaratorSyntax): void {
            if (this.inAmbientDeclaration && node.equalsValueClause) {
                this.pushDiagnostic(firstToken(node.equalsValueClause.value), DiagnosticCode.Initializers_are_not_allowed_in_ambient_contexts);
                return;
            }

            super.visitVariableDeclarator(node);
        }

        public visitConstructorDeclaration(node: ConstructorDeclarationSyntax): void {
            if (this.checkClassElementModifiers(node.modifiers) ||
                this.checkConstructorModifiers(node.modifiers) ||
                this.checkConstructorTypeParameterList(node) ||
                this.checkConstructorTypeAnnotation(node)) {

                return;
            }

            var savedCurrentConstructor = this.currentConstructor;
            this.currentConstructor = node;
            super.visitConstructorDeclaration(node);
            this.currentConstructor = savedCurrentConstructor;
        }

        private checkConstructorModifiers(modifiers: ISyntaxToken[]): boolean {
            for (var i = 0, n = modifiers.length; i < n; i++) {
                var child = modifiers[i];
                if (child.kind() !== SyntaxKind.PublicKeyword) {
                    this.pushDiagnostic(child, DiagnosticCode._0_modifier_cannot_appear_on_a_constructor_declaration, [SyntaxFacts.getText(child.kind())]);
                    return true;
                }
            }

            return false;
        }

        private checkConstructorTypeParameterList(node: ConstructorDeclarationSyntax): boolean {
            if (node.callSignature.typeParameterList) {
                this.pushDiagnostic(node.callSignature.typeParameterList, DiagnosticCode.Type_parameters_cannot_appear_on_a_constructor_declaration);
                return true;
            }

            return false;
        }

        private checkConstructorTypeAnnotation(node: ConstructorDeclarationSyntax): boolean {
            if (node.callSignature.typeAnnotation) {
                this.pushDiagnostic(node.callSignature.typeAnnotation, DiagnosticCode.Type_annotation_cannot_appear_on_a_constructor_declaration);
                return true;
            }

            return false;
        }

        public visitSourceUnit(node: SourceUnitSyntax): void {
            if (this.checkForDisallowedExports(node, node.moduleElements) ||
                this.checkForMultipleExportAssignments(node, node.moduleElements)) {
                
                return;
            }

            super.visitSourceUnit(node);
        }
    }

    function firstSyntaxTreeToken(syntaxTree: SyntaxTree) {
        // We don't just access the firstToken of the tree here as the tree may be abstract and may
        // not have a firstToken in it.
        var scanner = Scanner.createScanner(syntaxTree.languageVersion(), syntaxTree.text, () => { });
        return scanner.scan(/*allowContextualToken:*/ false);
    }

    export function externalModuleIndicatorSpan(syntaxTree: SyntaxTree): TextSpan {
        var firstToken = firstSyntaxTreeToken(syntaxTree);
        return externalModuleIndicatorSpanWorker(syntaxTree, firstToken);
    }

    export function externalModuleIndicatorSpanWorker(syntaxTree: SyntaxTree, firstToken: ISyntaxToken) {
        var leadingTrivia = firstToken.leadingTrivia(syntaxTree.text);
        return implicitImportSpan(leadingTrivia) || topLevelImportOrExportSpan(syntaxTree.sourceUnit());
    }

    function implicitImportSpan(sourceUnitLeadingTrivia: ISyntaxTriviaList): TextSpan {
        for (var i = 0, n = sourceUnitLeadingTrivia.count(); i < n; i++) {
            var trivia = sourceUnitLeadingTrivia.syntaxTriviaAt(i);

            if (trivia.isComment()) {
                var span = implicitImportSpanWorker(trivia);
                if (span) {
                    return span;
                }
            }
        }

        return null;
    }

    function implicitImportSpanWorker(trivia: ISyntaxTrivia): TextSpan {
        var implicitImportRegEx = /^(\/\/\/\s*<implicit-import\s*)*\/>/gim;
        var match = implicitImportRegEx.exec(trivia.fullText());

        if (match) {
            return new TextSpan(trivia.fullStart(), trivia.fullWidth());
        }

        return null;
    }

    function topLevelImportOrExportSpan(node: SourceUnitSyntax): TextSpan {
        for (var i = 0, n = node.moduleElements.length; i < n; i++) {
            var moduleElement = node.moduleElements[i];

            var _firstToken = firstToken(moduleElement);
            if (_firstToken !== null && _firstToken.kind() === SyntaxKind.ExportKeyword) {
                return new TextSpan(start(_firstToken), width(_firstToken));
            }

            if (moduleElement.kind() === SyntaxKind.ImportDeclaration) {
                var importDecl = <ImportDeclarationSyntax>moduleElement;
                if (importDecl.moduleReference.kind() === SyntaxKind.ExternalModuleReference) {
                    var literal = (<TypeScript.ExternalModuleReferenceSyntax>importDecl.moduleReference).stringLiteral;
                    return new TextSpan(start(literal), width(literal));
                }
            }
        }

        return null;;
    }
}
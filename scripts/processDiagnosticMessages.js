var TypeScript;
(function (TypeScript) {
    TypeScript.DiagnosticCode = {
        error_TS_0_1: "error TS{0}: {1}",
        warning_TS_0_1: "warning TS{0}: {1}",
        Unrecognized_escape_sequence: "Unrecognized escape sequence.",
        Unexpected_character_0: "Unexpected character {0}.",
        Missing_close_quote_character: "Missing close quote character.",
        Identifier_expected: "Identifier expected.",
        _0_keyword_expected: "'{0}' keyword expected.",
        _0_expected: "'{0}' expected.",
        Identifier_expected_0_is_a_keyword: "Identifier expected; '{0}' is a keyword.",
        Automatic_semicolon_insertion_not_allowed: "Automatic semicolon insertion not allowed.",
        Unexpected_token_0_expected: "Unexpected token; '{0}' expected.",
        Trailing_comma_not_allowed: "Trailing comma not allowed.",
        AsteriskSlash_expected: "'*/' expected.",
        public_or_private_modifier_must_precede_static: "'public' or 'private' modifier must precede 'static'.",
        Unexpected_token: "Unexpected token.",
        Catch_clause_parameter_cannot_have_a_type_annotation: "Catch clause parameter cannot have a type annotation.",
        A_rest_parameter_must_be_last_in_a_parameter_list: "A rest parameter must be last in a parameter list.",
        Parameter_cannot_have_question_mark_and_initializer: "Parameter cannot have question mark and initializer.",
        A_required_parameter_cannot_follow_an_optional_parameter: "A required parameter cannot follow an optional parameter.",
        Index_signatures_cannot_have_rest_parameters: "Index signatures cannot have rest parameters.",
        Index_signature_parameter_cannot_have_accessibility_modifiers: "Index signature parameter cannot have accessibility modifiers.",
        Index_signature_parameter_cannot_have_a_question_mark: "Index signature parameter cannot have a question mark.",
        Index_signature_parameter_cannot_have_an_initializer: "Index signature parameter cannot have an initializer.",
        Index_signature_must_have_a_type_annotation: "Index signature must have a type annotation.",
        Index_signature_parameter_must_have_a_type_annotation: "Index signature parameter must have a type annotation.",
        Index_signature_parameter_type_must_be_string_or_number: "Index signature parameter type must be 'string' or 'number'.",
        extends_clause_already_seen: "'extends' clause already seen.",
        extends_clause_must_precede_implements_clause: "'extends' clause must precede 'implements' clause.",
        Classes_can_only_extend_a_single_class: "Classes can only extend a single class.",
        implements_clause_already_seen: "'implements' clause already seen.",
        Accessibility_modifier_already_seen: "Accessibility modifier already seen.",
        _0_modifier_must_precede_1_modifier: "'{0}' modifier must precede '{1}' modifier.",
        _0_modifier_already_seen: "'{0}' modifier already seen.",
        _0_modifier_cannot_appear_on_a_class_element: "'{0}' modifier cannot appear on a class element.",
        Interface_declaration_cannot_have_implements_clause: "Interface declaration cannot have 'implements' clause.",
        super_invocation_cannot_have_type_arguments: "'super' invocation cannot have type arguments.",
        Only_ambient_modules_can_use_quoted_names: "Only ambient modules can use quoted names.",
        Statements_are_not_allowed_in_ambient_contexts: "Statements are not allowed in ambient contexts.",
        A_function_implementation_cannot_be_declared_in_an_ambient_context: "A function implementation cannot be declared in an ambient context.",
        A_declare_modifier_cannot_be_used_in_an_already_ambient_context: "A 'declare' modifier cannot be used in an already ambient context.",
        Initializers_are_not_allowed_in_ambient_contexts: "Initializers are not allowed in ambient contexts.",
        _0_modifier_cannot_appear_on_a_module_element: "'{0}' modifier cannot appear on a module element.",
        A_declare_modifier_cannot_be_used_with_an_interface_declaration: "A 'declare' modifier cannot be used with an interface declaration.",
        A_declare_modifier_is_required_for_a_top_level_declaration_in_a_d_ts_file: "A 'declare' modifier is required for a top level declaration in a .d.ts file.",
        A_rest_parameter_cannot_be_optional: "A rest parameter cannot be optional.",
        A_rest_parameter_cannot_have_an_initializer: "A rest parameter cannot have an initializer.",
        set_accessor_must_have_exactly_one_parameter: "'set' accessor must have exactly one parameter.",
        set_accessor_parameter_cannot_be_optional: "'set' accessor parameter cannot be optional.",
        set_accessor_parameter_cannot_have_an_initializer: "'set' accessor parameter cannot have an initializer.",
        set_accessor_cannot_have_rest_parameter: "'set' accessor cannot have rest parameter.",
        get_accessor_cannot_have_parameters: "'get' accessor cannot have parameters.",
        Modifiers_cannot_appear_here: "Modifiers cannot appear here.",
        Accessors_are_only_available_when_targeting_ECMAScript_5_and_higher: "Accessors are only available when targeting ECMAScript 5 and higher.",
        Enum_member_must_have_initializer: "Enum member must have initializer.",
        Export_assignment_cannot_be_used_in_internal_modules: "Export assignment cannot be used in internal modules.",
        Ambient_enum_elements_can_only_have_integer_literal_initializers: "Ambient enum elements can only have integer literal initializers.",
        module_class_interface_enum_import_or_statement: "module, class, interface, enum, import or statement",
        constructor_function_accessor_or_variable: "constructor, function, accessor or variable",
        statement: "statement",
        case_or_default_clause: "case or default clause",
        identifier: "identifier",
        call_construct_index_property_or_function_signature: "call, construct, index, property or function signature",
        expression: "expression",
        type_name: "type name",
        property_or_accessor: "property or accessor",
        parameter: "parameter",
        type: "type",
        type_parameter: "type parameter",
        A_declare_modifier_cannot_be_used_with_an_import_declaration: "A 'declare' modifier cannot be used with an import declaration.",
        Invalid_reference_directive_syntax: "Invalid 'reference' directive syntax.",
        Octal_literals_are_not_available_when_targeting_ECMAScript_5_and_higher: "Octal literals are not available when targeting ECMAScript 5 and higher.",
        Accessors_are_not_allowed_in_ambient_contexts: "Accessors are not allowed in ambient contexts.",
        _0_modifier_cannot_appear_on_a_constructor_declaration: "'{0}' modifier cannot appear on a constructor declaration.",
        _0_modifier_cannot_appear_on_a_parameter: "'{0}' modifier cannot appear on a parameter.",
        Only_a_single_variable_declaration_is_allowed_in_a_for_in_statement: "Only a single variable declaration is allowed in a 'for...in' statement.",
        Type_parameters_cannot_appear_on_a_constructor_declaration: "Type parameters cannot appear on a constructor declaration.",
        Type_annotation_cannot_appear_on_a_constructor_declaration: "Type annotation cannot appear on a constructor declaration.",
        Type_parameters_cannot_appear_on_an_accessor: "Type parameters cannot appear on an accessor.",
        Type_annotation_cannot_appear_on_a_set_accessor: "Type annotation cannot appear on a 'set' accessor.",
        Index_signature_must_have_exactly_one_parameter: "Index signature must have exactly one parameter.",
        _0_list_cannot_be_empty: "'{0}' list cannot be empty.",
        variable_declaration: "variable declaration",
        type_argument: "type argument",
        Invalid_use_of_0_in_strict_mode: "Invalid use of '{0}' in strict mode.",
        with_statements_are_not_allowed_in_strict_mode: "'with' statements are not allowed in strict mode.",
        delete_cannot_be_called_on_an_identifier_in_strict_mode: "'delete' cannot be called on an identifier in strict mode.",
        Invalid_left_hand_side_in_for_in_statement: "Invalid left-hand side in 'for...in' statement.",
        continue_statement_can_only_be_used_within_an_enclosing_iteration_statement: "'continue' statement can only be used within an enclosing iteration statement.",
        break_statement_can_only_be_used_within_an_enclosing_iteration_or_switch_statement: "'break' statement can only be used within an enclosing iteration or switch statement.",
        Jump_target_not_found: "Jump target not found.",
        Jump_target_cannot_cross_function_boundary: "Jump target cannot cross function boundary.",
        return_statement_must_be_contained_within_a_function_body: "'return' statement must be contained within a function body.",
        Expression_expected: "Expression expected.",
        Type_expected: "Type expected.",
        Duplicate_identifier_0: "Duplicate identifier '{0}'.",
        The_name_0_does_not_exist_in_the_current_scope: "The name '{0}' does not exist in the current scope.",
        The_name_0_does_not_refer_to_a_value: "The name '{0}' does not refer to a value.",
        super_can_only_be_used_inside_a_class_instance_method: "'super' can only be used inside a class instance method.",
        The_left_hand_side_of_an_assignment_expression_must_be_a_variable_property_or_indexer: "The left-hand side of an assignment expression must be a variable, property or indexer.",
        Value_of_type_0_is_not_callable_Did_you_mean_to_include_new: "Value of type '{0}' is not callable. Did you mean to include 'new'?",
        Value_of_type_0_is_not_callable: "Value of type '{0}' is not callable.",
        Value_of_type_0_is_not_newable: "Value of type '{0}' is not newable.",
        An_index_expression_argument_must_be_string_number_or_any: "An index expression argument must be 'string', 'number', or 'any'.",
        Operator_0_cannot_be_applied_to_types_1_and_2: "Operator '{0}' cannot be applied to types '{1}' and '{2}'.",
        Type_0_is_not_assignable_to_type_1: "Type '{0}' is not assignable to type '{1}'.",
        Type_0_is_not_assignable_to_type_1_NL_2: "Type '{0}' is not assignable to type '{1}':{NL}{2}",
        Expected_var_class_interface_or_module: "Expected var, class, interface, or module.",
        Getter_0_already_declared: "Getter '{0}' already declared.",
        Setter_0_already_declared: "Setter '{0}' already declared.",
        Exported_class_0_extends_private_class_1: "Exported class '{0}' extends private class '{1}'.",
        Exported_class_0_implements_private_interface_1: "Exported class '{0}' implements private interface '{1}'.",
        Exported_interface_0_extends_private_interface_1: "Exported interface '{0}' extends private interface '{1}'.",
        Exported_class_0_extends_class_from_inaccessible_module_1: "Exported class '{0}' extends class from inaccessible module {1}.",
        Exported_class_0_implements_interface_from_inaccessible_module_1: "Exported class '{0}' implements interface from inaccessible module {1}.",
        Exported_interface_0_extends_interface_from_inaccessible_module_1: "Exported interface '{0}' extends interface from inaccessible module {1}.",
        Public_static_property_0_of_exported_class_has_or_is_using_private_type_1: "Public static property '{0}' of exported class has or is using private type '{1}'.",
        Public_property_0_of_exported_class_has_or_is_using_private_type_1: "Public property '{0}' of exported class has or is using private type '{1}'.",
        Property_0_of_exported_interface_has_or_is_using_private_type_1: "Property '{0}' of exported interface has or is using private type '{1}'.",
        Exported_variable_0_has_or_is_using_private_type_1: "Exported variable '{0}' has or is using private type '{1}'.",
        Public_static_property_0_of_exported_class_is_using_inaccessible_module_1: "Public static property '{0}' of exported class is using inaccessible module {1}.",
        Public_property_0_of_exported_class_is_using_inaccessible_module_1: "Public property '{0}' of exported class is using inaccessible module {1}.",
        Property_0_of_exported_interface_is_using_inaccessible_module_1: "Property '{0}' of exported interface is using inaccessible module {1}.",
        Exported_variable_0_is_using_inaccessible_module_1: "Exported variable '{0}' is using inaccessible module {1}.",
        Parameter_0_of_constructor_from_exported_class_has_or_is_using_private_type_1: "Parameter '{0}' of constructor from exported class has or is using private type '{1}'.",
        Parameter_0_of_public_static_property_setter_from_exported_class_has_or_is_using_private_type_1: "Parameter '{0}' of public static property setter from exported class has or is using private type '{1}'.",
        Parameter_0_of_public_property_setter_from_exported_class_has_or_is_using_private_type_1: "Parameter '{0}' of public property setter from exported class has or is using private type '{1}'.",
        Parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_private_type_1: "Parameter '{0}' of constructor signature from exported interface has or is using private type '{1}'.",
        Parameter_0_of_call_signature_from_exported_interface_has_or_is_using_private_type_1: "Parameter '{0}' of call signature from exported interface has or is using private type '{1}'.",
        Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_private_type_1: "Parameter '{0}' of public static method from exported class has or is using private type '{1}'.",
        Parameter_0_of_public_method_from_exported_class_has_or_is_using_private_type_1: "Parameter '{0}' of public method from exported class has or is using private type '{1}'.",
        Parameter_0_of_method_from_exported_interface_has_or_is_using_private_type_1: "Parameter '{0}' of method from exported interface has or is using private type '{1}'.",
        Parameter_0_of_exported_function_has_or_is_using_private_type_1: "Parameter '{0}' of exported function has or is using private type '{1}'.",
        Parameter_0_of_constructor_from_exported_class_is_using_inaccessible_module_1: "Parameter '{0}' of constructor from exported class is using inaccessible module {1}.",
        Parameter_0_of_public_static_property_setter_from_exported_class_is_using_inaccessible_module_1: "Parameter '{0}' of public static property setter from exported class is using inaccessible module {1}.",
        Parameter_0_of_public_property_setter_from_exported_class_is_using_inaccessible_module_1: "Parameter '{0}' of public property setter from exported class is using inaccessible module {1}.",
        Parameter_0_of_constructor_signature_from_exported_interface_is_using_inaccessible_module_1: "Parameter '{0}' of constructor signature from exported interface is using inaccessible module {1}.",
        Parameter_0_of_call_signature_from_exported_interface_is_using_inaccessible_module_1: "Parameter '{0}' of call signature from exported interface is using inaccessible module {1}",
        Parameter_0_of_public_static_method_from_exported_class_is_using_inaccessible_module_1: "Parameter '{0}' of public static method from exported class is using inaccessible module {1}.",
        Parameter_0_of_public_method_from_exported_class_is_using_inaccessible_module_1: "Parameter '{0}' of public method from exported class is using inaccessible module {1}.",
        Parameter_0_of_method_from_exported_interface_is_using_inaccessible_module_1: "Parameter '{0}' of method from exported interface is using inaccessible module {1}.",
        Parameter_0_of_exported_function_is_using_inaccessible_module_1: "Parameter '{0}' of exported function is using inaccessible module {1}.",
        Return_type_of_public_static_property_getter_from_exported_class_has_or_is_using_private_type_0: "Return type of public static property getter from exported class has or is using private type '{0}'.",
        Return_type_of_public_property_getter_from_exported_class_has_or_is_using_private_type_0: "Return type of public property getter from exported class has or is using private type '{0}'.",
        Return_type_of_constructor_signature_from_exported_interface_has_or_is_using_private_type_0: "Return type of constructor signature from exported interface has or is using private type '{0}'.",
        Return_type_of_call_signature_from_exported_interface_has_or_is_using_private_type_0: "Return type of call signature from exported interface has or is using private type '{0}'.",
        Return_type_of_index_signature_from_exported_interface_has_or_is_using_private_type_0: "Return type of index signature from exported interface has or is using private type '{0}'.",
        Return_type_of_public_static_method_from_exported_class_has_or_is_using_private_type_0: "Return type of public static method from exported class has or is using private type '{0}'.",
        Return_type_of_public_method_from_exported_class_has_or_is_using_private_type_0: "Return type of public method from exported class has or is using private type '{0}'.",
        Return_type_of_method_from_exported_interface_has_or_is_using_private_type_0: "Return type of method from exported interface has or is using private type '{0}'.",
        Return_type_of_exported_function_has_or_is_using_private_type_0: "Return type of exported function has or is using private type '{0}'.",
        Return_type_of_public_static_property_getter_from_exported_class_is_using_inaccessible_module_0: "Return type of public static property getter from exported class is using inaccessible module {0}.",
        Return_type_of_public_property_getter_from_exported_class_is_using_inaccessible_module_0: "Return type of public property getter from exported class is using inaccessible module {0}.",
        Return_type_of_constructor_signature_from_exported_interface_is_using_inaccessible_module_0: "Return type of constructor signature from exported interface is using inaccessible module {0}.",
        Return_type_of_call_signature_from_exported_interface_is_using_inaccessible_module_0: "Return type of call signature from exported interface is using inaccessible module {0}.",
        Return_type_of_index_signature_from_exported_interface_is_using_inaccessible_module_0: "Return type of index signature from exported interface is using inaccessible module {0}.",
        Return_type_of_public_static_method_from_exported_class_is_using_inaccessible_module_0: "Return type of public static method from exported class is using inaccessible module {0}.",
        Return_type_of_public_method_from_exported_class_is_using_inaccessible_module_0: "Return type of public method from exported class is using inaccessible module {0}.",
        Return_type_of_method_from_exported_interface_is_using_inaccessible_module_0: "Return type of method from exported interface is using inaccessible module {0}.",
        Return_type_of_exported_function_is_using_inaccessible_module_0: "Return type of exported function is using inaccessible module {0}.",
        new_T_cannot_be_used_to_create_an_array_Use_new_Array_T_instead: "'new T[]' cannot be used to create an array. Use 'new Array<T>()' instead.",
        A_parameter_list_must_follow_a_generic_type_argument_list_expected: "A parameter list must follow a generic type argument list. '(' expected.",
        Multiple_constructor_implementations_are_not_allowed: "Multiple constructor implementations are not allowed.",
        Cannot_find_external_module_0: "Cannot find external module '{0}'.",
        Module_cannot_be_aliased_to_a_non_module_type: "Module cannot be aliased to a non-module type.",
        A_class_may_only_extend_another_class: "A class may only extend another class.",
        A_class_may_only_implement_another_class_or_interface: "A class may only implement another class or interface.",
        An_interface_may_only_extend_a_class_or_another_interface: "An interface may only extend a class or another interface.",
        Unable_to_resolve_type: "Unable to resolve type.",
        Unable_to_resolve_type_of_0: "Unable to resolve type of '{0}'.",
        Unable_to_resolve_type_parameter_constraint: "Unable to resolve type parameter constraint.",
        Type_parameter_constraint_cannot_be_a_primitive_type: "Type parameter constraint cannot be a primitive type.",
        Supplied_parameters_do_not_match_any_signature_of_call_target: "Supplied parameters do not match any signature of call target.",
        Supplied_parameters_do_not_match_any_signature_of_call_target_NL_0: "Supplied parameters do not match any signature of call target:{NL}{0}",
        Cannot_use_new_with_an_expression_whose_type_lacks_a_signature: "Cannot use 'new' with an expression whose type lacks a signature.",
        Only_a_void_function_can_be_called_with_the_new_keyword: "Only a void function can be called with the 'new' keyword.",
        Could_not_select_overload_for_new_expression: "Could not select overload for 'new' expression.",
        Type_0_does_not_satisfy_the_constraint_1: "Type '{0}' does not satisfy the constraint '{1}'.",
        Could_not_select_overload_for_call_expression: "Could not select overload for 'call' expression.",
        Cannot_invoke_an_expression_whose_type_lacks_a_call_signature: "Cannot invoke an expression whose type lacks a call signature.",
        Calls_to_super_are_only_valid_inside_a_class: "Calls to 'super' are only valid inside a class.",
        Generic_type_0_requires_1_type_argument_s: "Generic type '{0}' requires {1} type argument(s).",
        Type_of_array_literal_cannot_be_determined_Best_common_type_could_not_be_found_for_array_elements: "Type of array literal cannot be determined. Best common type could not be found for array elements.",
        Could_not_find_enclosing_symbol_for_dotted_name_0: "Could not find enclosing symbol for dotted name '{0}'.",
        Property_0_does_not_exist_on_value_of_type_1: "Property '{0}' does not exist on value of type '{1}'.",
        Cannot_find_name_0: "Cannot find name '{0}'.",
        get_and_set_accessor_must_have_the_same_type: "'get' and 'set' accessor must have the same type.",
        this_cannot_be_referenced_in_current_location: "'this' cannot be referenced in current location.",
        Static_members_cannot_reference_class_type_parameters: "Static members cannot reference class type parameters.",
        Type_0_recursively_references_itself_as_a_base_type: "Type '{0}' recursively references itself as a base type.",
        super_property_access_is_permitted_only_in_a_constructor_member_function_or_member_accessor_of_a_derived_class: "'super' property access is permitted only in a constructor, member function, or member accessor of a derived class.",
        super_can_only_be_referenced_in_a_derived_class: "'super' can only be referenced in a derived class.",
        A_super_call_must_be_the_first_statement_in_the_constructor_when_a_class_contains_initialized_properties_or_has_parameter_properties: "A 'super' call must be the first statement in the constructor when a class contains initialized properties or has parameter properties.",
        Constructors_for_derived_classes_must_contain_a_super_call: "Constructors for derived classes must contain a 'super' call.",
        Super_calls_are_not_permitted_outside_constructors_or_in_nested_functions_inside_constructors: "Super calls are not permitted outside constructors or in nested functions inside constructors.",
        _0_1_is_inaccessible: "'{0}.{1}' is inaccessible.",
        this_cannot_be_referenced_in_a_module_body: "'this' cannot be referenced in a module body.",
        Invalid_expression_types_not_known_to_support_the_addition_operator: "Invalid '+' expression - types not known to support the addition operator.",
        The_right_hand_side_of_an_arithmetic_operation_must_be_of_type_any_number_or_an_enum_type: "The right-hand side of an arithmetic operation must be of type 'any', 'number' or an enum type.",
        The_left_hand_side_of_an_arithmetic_operation_must_be_of_type_any_number_or_an_enum_type: "The left-hand side of an arithmetic operation must be of type 'any', 'number' or an enum type.",
        An_arithmetic_operand_must_be_of_type_any_number_or_an_enum_type: "An arithmetic operand must be of type 'any', 'number' or an enum type.",
        Variable_declarations_of_a_for_statement_cannot_use_a_type_annotation: "Variable declarations of a 'for' statement cannot use a type annotation.",
        Variable_declarations_of_a_for_statement_must_be_of_types_string_or_any: "Variable declarations of a 'for' statement must be of types 'string' or 'any'.",
        The_right_hand_side_of_a_for_in_statement_must_be_of_type_any_an_object_type_or_a_type_parameter: "The right-hand side of a 'for...in' statement must be of type 'any', an object type or a type parameter.",
        The_left_hand_side_of_an_in_expression_must_be_of_types_any_string_or_number: "The left-hand side of an 'in' expression must be of types 'any', 'string' or 'number'.",
        The_right_hand_side_of_an_in_expression_must_be_of_type_any_an_object_type_or_a_type_parameter: "The right-hand side of an 'in' expression must be of type 'any', an object type or a type parameter.",
        The_left_hand_side_of_an_instanceof_expression_must_be_of_type_any_an_object_type_or_a_type_parameter: "The left-hand side of an 'instanceof' expression must be of type 'any', an object type or a type parameter.",
        The_right_hand_side_of_an_instanceof_expression_must_be_of_type_any_or_of_a_type_assignable_to_the_Function_interface_type: "The right-hand side of an 'instanceof' expression must be of type 'any' or of a type assignable to the 'Function' interface type.",
        Setters_cannot_return_a_value: "Setters cannot return a value.",
        Tried_to_query_type_of_uninitialized_module_0: "Tried to query type of uninitialized module '{0}'.",
        Tried_to_set_variable_type_to_uninitialized_module_type_0: "Tried to set variable type to uninitialized module type '{0}'.",
        Type_0_is_not_generic: "Type '{0}' is not generic.",
        Getters_must_return_a_value: "Getters must return a value.",
        Getter_and_setter_accessors_do_not_agree_in_visibility: "Getter and setter accessors do not agree in visibility.",
        Invalid_left_hand_side_of_assignment_expression: "Invalid left-hand side of assignment expression.",
        Function_declared_a_non_void_return_type_but_has_no_return_expression: "Function declared a non-void return type, but has no return expression.",
        Cannot_resolve_return_type_reference: "Cannot resolve return type reference.",
        Constructors_cannot_have_a_return_type_of_void: "Constructors cannot have a return type of 'void'.",
        Subsequent_variable_declarations_must_have_the_same_type_Variable_0_must_be_of_type_1_but_here_has_type_2: "Subsequent variable declarations must have the same type.  Variable '{0}' must be of type '{1}', but here has type '{2}'.",
        All_symbols_within_a_with_block_will_be_resolved_to_any: "All symbols within a with block will be resolved to 'any'.",
        Import_declarations_in_an_internal_module_cannot_reference_an_external_module: "Import declarations in an internal module cannot reference an external module.",
        Class_0_declares_interface_1_but_does_not_implement_it_NL_2: "Class {0} declares interface {1} but does not implement it:{NL}{2}",
        Class_0_declares_class_1_as_an_interface_but_does_not_implement_it_NL_2: "Class {0} declares class {1} as an interface but does not implement it:{NL}{2}",
        The_operand_of_an_increment_or_decrement_operator_must_be_a_variable_property_or_indexer: "The operand of an increment or decrement operator must be a variable, property or indexer.",
        this_cannot_be_referenced_in_a_static_property_initializer: "'this' cannot be referenced in a static property initializer.",
        Class_0_cannot_extend_class_1_NL_2: "Class '{0}' cannot extend class '{1}':{NL}{2}",
        Interface_0_cannot_extend_class_1_NL_2: "Interface '{0}' cannot extend class '{1}':{NL}{2}",
        Interface_0_cannot_extend_interface_1_NL_2: "Interface '{0}' cannot extend interface '{1}':{NL}{2}",
        Overload_signature_is_not_compatible_with_function_definition: "Overload signature is not compatible with function definition.",
        Overload_signature_is_not_compatible_with_function_definition_NL_0: "Overload signature is not compatible with function definition:{NL}{0}",
        Overload_signatures_must_all_be_public_or_private: "Overload signatures must all be public or private.",
        Overload_signatures_must_all_be_exported_or_not_exported: "Overload signatures must all be exported or not exported.",
        Overload_signatures_must_all_be_ambient_or_non_ambient: "Overload signatures must all be ambient or non-ambient.",
        Overload_signatures_must_all_be_optional_or_required: "Overload signatures must all be optional or required.",
        Specialized_overload_signature_is_not_assignable_to_any_non_specialized_signature: "Specialized overload signature is not assignable to any non-specialized signature.",
        this_cannot_be_referenced_in_constructor_arguments: "'this' cannot be referenced in constructor arguments.",
        Instance_member_cannot_be_accessed_off_a_class: "Instance member cannot be accessed off a class.",
        Untyped_function_calls_may_not_accept_type_arguments: "Untyped function calls may not accept type arguments.",
        Non_generic_functions_may_not_accept_type_arguments: "Non-generic functions may not accept type arguments.",
        A_generic_type_may_not_reference_itself_with_a_wrapped_form_of_its_own_type_parameters: "A generic type may not reference itself with a wrapped form of its own type parameters.",
        A_rest_parameter_must_be_of_an_array_type: "A rest parameter must be of an array type.",
        Overload_signature_implementation_cannot_use_specialized_type: "Overload signature implementation cannot use specialized type.",
        Export_assignments_may_only_be_used_at_the_top_level_of_external_modules: "Export assignments may only be used at the top-level of external modules.",
        Export_assignments_may_only_be_made_with_variables_functions_classes_interfaces_enums_and_internal_modules: "Export assignments may only be made with variables, functions, classes, interfaces, enums and internal modules.",
        Only_public_methods_of_the_base_class_are_accessible_via_the_super_keyword: "Only public methods of the base class are accessible via the 'super' keyword.",
        Numeric_indexer_type_0_must_be_assignable_to_string_indexer_type_1: "Numeric indexer type '{0}' must be assignable to string indexer type '{1}'.",
        Numeric_indexer_type_0_must_be_assignable_to_string_indexer_type_1_NL_2: "Numeric indexer type '{0}' must be assignable to string indexer type '{1}':{NL}{2}",
        All_numerically_named_properties_must_be_assignable_to_numeric_indexer_type_0: "All numerically named properties must be assignable to numeric indexer type '{0}'.",
        All_numerically_named_properties_must_be_assignable_to_numeric_indexer_type_0_NL_1: "All numerically named properties must be assignable to numeric indexer type '{0}':{NL}{1}",
        All_named_properties_must_be_assignable_to_string_indexer_type_0: "All named properties must be assignable to string indexer type '{0}'.",
        All_named_properties_must_be_assignable_to_string_indexer_type_0_NL_1: "All named properties must be assignable to string indexer type '{0}':{NL}{1}",
        A_parameter_initializer_is_only_allowed_in_a_function_or_constructor_implementation: "A parameter initializer is only allowed in a function or constructor implementation.",
        Function_expression_declared_a_non_void_return_type_but_has_no_return_expression: "Function expression declared a non-void return type, but has no return expression.",
        Import_declaration_referencing_identifier_from_internal_module_can_only_be_made_with_variables_functions_classes_interfaces_enums_and_internal_modules: "Import declaration referencing identifier from internal module can only be made with variables, functions, classes, interfaces, enums and internal modules.",
        Module_0_has_no_exported_member_1: "Module '{0}' has no exported member '{1}'.",
        Unable_to_resolve_module_reference_0: "Unable to resolve module reference '{0}'.",
        Could_not_find_module_0_in_module_1: "Could not find module '{0}' in module '{1}'.",
        Exported_import_declaration_0_is_assigned_value_with_type_that_has_or_is_using_private_type_1: "Exported import declaration '{0}' is assigned value with type that has or is using private type '{1}'.",
        Exported_import_declaration_0_is_assigned_value_with_type_that_is_using_inaccessible_module_1: "Exported import declaration '{0}' is assigned value with type that is using inaccessible module '{1}'.",
        Exported_import_declaration_0_is_assigned_type_that_has_or_is_using_private_type_1: "Exported import declaration '{0}' is assigned type that has or is using private type '{1}'.",
        Exported_import_declaration_0_is_assigned_type_that_is_using_inaccessible_module_1: "Exported import declaration '{0}' is assigned type that is using inaccessible module '{1}'.",
        Exported_import_declaration_0_is_assigned_container_that_is_or_is_using_inaccessible_module_1: "Exported import declaration '{0}' is assigned container that is or is using inaccessible module '{1}'.",
        Type_name_0_in_extends_clause_does_not_reference_constructor_function_for_1: "Type name '{0}' in extends clause does not reference constructor function for '{1}'.",
        Internal_module_reference_0_in_import_declaration_does_not_reference_module_instance_for_1: "Internal module reference '{0}' in import declaration does not reference module instance for '{1}'.",
        Module_0_cannot_merge_with_previous_declaration_of_1_in_a_different_file_2: "Module '{0}' cannot merge with previous declaration of '{1}' in a different file '{2}'.",
        Interface_0_cannot_simultaneously_extend_types_1_and_2_NL_3: "Interface '{0}' cannot simultaneously extend types '{1}' and '{2}':{NL}{3}",
        Initializer_of_parameter_0_cannot_reference_identifier_1_declared_after_it: "Initializer of parameter '{0}' cannot reference identifier '{1}' declared after it.",
        Ambient_external_module_declaration_cannot_be_reopened: "Ambient external module declaration cannot be reopened.",
        All_declarations_of_merged_declaration_0_must_be_exported_or_not_exported: "All declarations of merged declaration '{0}' must be exported or not exported.",
        super_cannot_be_referenced_in_constructor_arguments: "'super' cannot be referenced in constructor arguments.",
        Return_type_of_constructor_signature_must_be_assignable_to_the_instance_type_of_the_class: "Return type of constructor signature must be assignable to the instance type of the class.",
        Ambient_external_module_declaration_must_be_defined_in_global_context: "Ambient external module declaration must be defined in global context.",
        Ambient_external_module_declaration_cannot_specify_relative_module_name: "Ambient external module declaration cannot specify relative module name.",
        Import_declaration_in_an_ambient_external_module_declaration_cannot_reference_external_module_through_relative_external_module_name: "Import declaration in an ambient external module declaration cannot reference external module through relative external module name.",
        No_best_common_type_exists_among_return_expressions: "No best common type exists among return expressions.",
        Import_declaration_cannot_refer_to_external_module_reference_when_noResolve_option_is_set: "Import declaration cannot refer to external module reference when --noResolve option is set.",
        Duplicate_identifier_this_Compiler_uses_variable_declaration_this_to_capture_this_reference: "Duplicate identifier '_this'. Compiler uses variable declaration '_this' to capture 'this' reference.",
        Duplicate_identifier_super_Compiler_uses_super_to_capture_base_class_reference: "Duplicate identifier '_super'. Compiler uses '_super' to capture base class reference.",
        Expression_resolves_to_variable_declaration_this_that_compiler_uses_to_capture_this_reference: "Expression resolves to variable declaration '_this' that compiler uses to capture 'this' reference.",
        Expression_resolves_to_super_that_compiler_uses_to_capture_base_class_reference: "Expression resolves to '_super' that compiler uses to capture base class reference.",
        TypeParameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_private_type_1: "TypeParameter '{0}' of constructor signature from exported interface has or is using private type '{1}'.",
        TypeParameter_0_of_call_signature_from_exported_interface_has_or_is_using_private_type_1: "TypeParameter '{0}' of call signature from exported interface has or is using private type '{1}'.",
        TypeParameter_0_of_public_static_method_from_exported_class_has_or_is_using_private_type_1: "TypeParameter '{0}' of public static method from exported class has or is using private type '{1}'.",
        TypeParameter_0_of_public_method_from_exported_class_has_or_is_using_private_type_1: "TypeParameter '{0}' of public method from exported class has or is using private type '{1}'.",
        TypeParameter_0_of_method_from_exported_interface_has_or_is_using_private_type_1: "TypeParameter '{0}' of method from exported interface has or is using private type '{1}'.",
        TypeParameter_0_of_exported_function_has_or_is_using_private_type_1: "TypeParameter '{0}' of exported function has or is using private type '{1}'.",
        TypeParameter_0_of_constructor_signature_from_exported_interface_is_using_inaccessible_module_1: "TypeParameter '{0}' of constructor signature from exported interface is using inaccessible module {1}.",
        TypeParameter_0_of_call_signature_from_exported_interface_is_using_inaccessible_module_1: "TypeParameter '{0}' of call signature from exported interface is using inaccessible module {1}",
        TypeParameter_0_of_public_static_method_from_exported_class_is_using_inaccessible_module_1: "TypeParameter '{0}' of public static method from exported class is using inaccessible module {1}.",
        TypeParameter_0_of_public_method_from_exported_class_is_using_inaccessible_module_1: "TypeParameter '{0}' of public method from exported class is using inaccessible module {1}.",
        TypeParameter_0_of_method_from_exported_interface_is_using_inaccessible_module_1: "TypeParameter '{0}' of method from exported interface is using inaccessible module {1}.",
        TypeParameter_0_of_exported_function_is_using_inaccessible_module_1: "TypeParameter '{0}' of exported function is using inaccessible module {1}.",
        TypeParameter_0_of_exported_class_has_or_is_using_private_type_1: "TypeParameter '{0}' of exported class has or is using private type '{1}'.",
        TypeParameter_0_of_exported_interface_has_or_is_using_private_type_1: "TypeParameter '{0}' of exported interface has or is using private type '{1}'.",
        TypeParameter_0_of_exported_class_is_using_inaccessible_module_1: "TypeParameter '{0}' of exported class is using inaccessible module {1}.",
        TypeParameter_0_of_exported_interface_is_using_inaccessible_module_1: "TypeParameter '{0}' of exported interface is using inaccessible module {1}.",
        Duplicate_identifier_i_Compiler_uses_i_to_initialize_rest_parameter: "Duplicate identifier '_i'. Compiler uses '_i' to initialize rest parameter.",
        Duplicate_identifier_arguments_Compiler_uses_arguments_to_initialize_rest_parameters: "Duplicate identifier 'arguments'. Compiler uses 'arguments' to initialize rest parameters.",
        No_best_common_type_exists_between_0_and_1: "No best common type exists between '{0}' and '{1}'.",
        No_best_common_type_exists_between_0_1_and_2: "No best common type exists between '{0}', '{1}', and '{2}'.",
        Duplicate_identifier_0_Compiler_reserves_name_1_in_top_level_scope_of_an_external_module: "Duplicate identifier '{0}'. Compiler reserves name '{1}' in top level scope of an external module.",
        Constraint_of_a_type_parameter_cannot_reference_any_type_parameter_from_the_same_type_parameter_list: "Constraint of a type parameter cannot reference any type parameter from the same type parameter list.",
        Initializer_of_instance_member_variable_0_cannot_reference_identifier_1_declared_in_the_constructor: "Initializer of instance member variable '{0}' cannot reference identifier '{1}' declared in the constructor.",
        Parameter_0_cannot_be_referenced_in_its_initializer: "Parameter '{0}' cannot be referenced in its initializer.",
        Duplicate_string_index_signature: "Duplicate string index signature.",
        Duplicate_number_index_signature: "Duplicate number index signature.",
        All_declarations_of_an_interface_must_have_identical_type_parameters: "All declarations of an interface must have identical type parameters.",
        Expression_resolves_to_variable_declaration_i_that_compiler_uses_to_initialize_rest_parameter: "Expression resolves to variable declaration '_i' that compiler uses to initialize rest parameter.",
        Neither_type_0_nor_type_1_is_assignable_to_the_other: "Neither type '{0}' nor type '{1}' is assignable to the other.",
        Neither_type_0_nor_type_1_is_assignable_to_the_other_NL_2: "Neither type '{0}' nor type '{1}' is assignable to the other:{NL}{2}",
        Duplicate_function_implementation: "Duplicate function implementation.",
        Function_implementation_expected: "Function implementation expected.",
        Function_overload_name_must_be_0: "Function overload name must be '{0}'.",
        Constructor_implementation_expected: "Constructor implementation expected.",
        Class_name_cannot_be_0: "Class name cannot be '{0}'.",
        Interface_name_cannot_be_0: "Interface name cannot be '{0}'.",
        Enum_name_cannot_be_0: "Enum name cannot be '{0}'.",
        A_module_cannot_have_multiple_export_assignments: "A module cannot have multiple export assignments.",
        Export_assignment_not_allowed_in_module_with_exported_element: "Export assignment not allowed in module with exported element.",
        A_parameter_property_is_only_allowed_in_a_constructor_implementation: "A parameter property is only allowed in a constructor implementation.",
        Function_overload_must_be_static: "Function overload must be static.",
        Function_overload_must_not_be_static: "Function overload must not be static.",
        Type_0_is_missing_property_1_from_type_2: "Type '{0}' is missing property '{1}' from type '{2}'.",
        Types_of_property_0_of_types_1_and_2_are_incompatible: "Types of property '{0}' of types '{1}' and '{2}' are incompatible.",
        Types_of_property_0_of_types_1_and_2_are_incompatible_NL_3: "Types of property '{0}' of types '{1}' and '{2}' are incompatible:{NL}{3}",
        Property_0_defined_as_private_in_type_1_is_defined_as_public_in_type_2: "Property '{0}' defined as private in type '{1}' is defined as public in type '{2}'.",
        Property_0_defined_as_public_in_type_1_is_defined_as_private_in_type_2: "Property '{0}' defined as public in type '{1}' is defined as private in type '{2}'.",
        Types_0_and_1_define_property_2_as_private: "Types '{0}' and '{1}' define property '{2}' as private.",
        Call_signatures_of_types_0_and_1_are_incompatible: "Call signatures of types '{0}' and '{1}' are incompatible.",
        Call_signatures_of_types_0_and_1_are_incompatible_NL_2: "Call signatures of types '{0}' and '{1}' are incompatible:{NL}{2}",
        Type_0_requires_a_call_signature_but_type_1_lacks_one: "Type '{0}' requires a call signature, but type '{1}' lacks one.",
        Construct_signatures_of_types_0_and_1_are_incompatible: "Construct signatures of types '{0}' and '{1}' are incompatible.",
        Construct_signatures_of_types_0_and_1_are_incompatible_NL_2: "Construct signatures of types '{0}' and '{1}' are incompatible:{NL}{2}",
        Type_0_requires_a_construct_signature_but_type_1_lacks_one: "Type '{0}' requires a construct signature, but type '{1}' lacks one.",
        Index_signatures_of_types_0_and_1_are_incompatible: "Index signatures of types '{0}' and '{1}' are incompatible.",
        Index_signatures_of_types_0_and_1_are_incompatible_NL_2: "Index signatures of types '{0}' and '{1}' are incompatible:{NL}{2}",
        Call_signature_expects_0_or_fewer_parameters: "Call signature expects {0} or fewer parameters.",
        Could_not_apply_type_0_to_argument_1_which_is_of_type_2: "Could not apply type '{0}' to argument {1} which is of type '{2}'.",
        Class_0_defines_instance_member_accessor_1_but_extended_class_2_defines_it_as_instance_member_function: "Class '{0}' defines instance member accessor '{1}', but extended class '{2}' defines it as instance member function.",
        Class_0_defines_instance_member_property_1_but_extended_class_2_defines_it_as_instance_member_function: "Class '{0}' defines instance member property '{1}', but extended class '{2}' defines it as instance member function.",
        Class_0_defines_instance_member_function_1_but_extended_class_2_defines_it_as_instance_member_accessor: "Class '{0}' defines instance member function '{1}', but extended class '{2}' defines it as instance member accessor.",
        Class_0_defines_instance_member_function_1_but_extended_class_2_defines_it_as_instance_member_property: "Class '{0}' defines instance member function '{1}', but extended class '{2}' defines it as instance member property.",
        Types_of_static_property_0_of_class_1_and_class_2_are_incompatible: "Types of static property '{0}' of class '{1}' and class '{2}' are incompatible.",
        Types_of_static_property_0_of_class_1_and_class_2_are_incompatible_NL_3: "Types of static property '{0}' of class '{1}' and class '{2}' are incompatible:{NL}{3}",
        Type_reference_cannot_refer_to_container_0: "Type reference cannot refer to container '{0}'.",
        Type_reference_must_refer_to_type: "Type reference must refer to type.",
        In_enums_with_multiple_declarations_only_one_declaration_can_omit_an_initializer_for_the_first_enum_element: "In enums with multiple declarations only one declaration can omit an initializer for the first enum element.",
        _0_overload_s: " (+ {0} overload(s))",
        Variable_declaration_cannot_have_the_same_name_as_an_import_declaration: "Variable declaration cannot have the same name as an import declaration.",
        Signature_expected_0_type_arguments_got_1_instead: "Signature expected {0} type arguments, got {1} instead.",
        Property_0_defined_as_optional_in_type_1_but_is_required_in_type_2: "Property '{0}' defined as optional in type '{1}', but is required in type '{2}'.",
        Types_0_and_1_originating_in_infinitely_expanding_type_reference_do_not_refer_to_same_named_type: "Types '{0}' and '{1}' originating in infinitely expanding type reference do not refer to same named type.",
        Types_0_and_1_originating_in_infinitely_expanding_type_reference_have_incompatible_type_arguments: "Types '{0}' and '{1}' originating in infinitely expanding type reference have incompatible type arguments.",
        Types_0_and_1_originating_in_infinitely_expanding_type_reference_have_incompatible_type_arguments_NL_2: "Types '{0}' and '{1}' originating in infinitely expanding type reference have incompatible type arguments:{NL}{2}",
        Named_properties_0_of_types_1_and_2_are_not_identical: "Named properties '{0}' of types '{1}' and '{2}' are not identical.",
        Types_of_string_indexer_of_types_0_and_1_are_not_identical: "Types of string indexer of types '{0}' and '{1}' are not identical.",
        Types_of_number_indexer_of_types_0_and_1_are_not_identical: "Types of number indexer of types '{0}' and '{1}' are not identical.",
        Type_of_number_indexer_in_type_0_is_not_assignable_to_string_indexer_type_in_type_1_NL_2: "Type of number indexer in type '{0}' is not assignable to string indexer type in type '{1}'.{NL}{2}",
        Type_of_property_0_in_type_1_is_not_assignable_to_string_indexer_type_in_type_2_NL_3: "Type of property '{0}' in type '{1}' is not assignable to string indexer type in type '{2}'.{NL}{3}",
        Type_of_property_0_in_type_1_is_not_assignable_to_number_indexer_type_in_type_2_NL_3: "Type of property '{0}' in type '{1}' is not assignable to number indexer type in type '{2}'.{NL}{3}",
        Static_property_0_defined_as_private_in_type_1_is_defined_as_public_in_type_2: "Static property '{0}' defined as private in type '{1}' is defined as public in type '{2}'.",
        Static_property_0_defined_as_public_in_type_1_is_defined_as_private_in_type_2: "Static property '{0}' defined as public in type '{1}' is defined as private in type '{2}'.",
        Types_0_and_1_define_static_property_2_as_private: "Types '{0}' and '{1}' define static property '{2}' as private.",
        Current_host_does_not_support_0_option: "Current host does not support '{0}' option.",
        ECMAScript_target_version_0_not_supported_Specify_a_valid_target_version_1_default_or_2: "ECMAScript target version '{0}' not supported.  Specify a valid target version: '{1}' (default), or '{2}'",
        Argument_for_0_option_must_be_1_or_2: "Argument for '{0}' option must be '{1}' or '{2}'",
        Could_not_find_file_0: "Could not find file: '{0}'.",
        A_file_cannot_have_a_reference_to_itself: "A file cannot have a reference to itself.",
        Cannot_resolve_referenced_file_0: "Cannot resolve referenced file: '{0}'.",
        Cannot_find_the_common_subdirectory_path_for_the_input_files: "Cannot find the common subdirectory path for the input files.",
        Emit_Error_0: "Emit Error: {0}.",
        Cannot_read_file_0_1: "Cannot read file '{0}': {1}",
        Unsupported_file_encoding: "Unsupported file encoding.",
        Locale_must_be_of_the_form_language_or_language_territory_For_example_0_or_1: "Locale must be of the form <language> or <language>-<territory>. For example '{0}' or '{1}'.",
        Unsupported_locale_0: "Unsupported locale: '{0}'.",
        Execution_Failed_NL: "Execution Failed.{NL}",
        Invalid_call_to_up: "Invalid call to 'up'",
        Invalid_call_to_down: "Invalid call to 'down'",
        Base64_value_0_finished_with_a_continuation_bit: "Base64 value '{0}' finished with a continuation bit.",
        Unknown_compiler_option_0: "Unknown compiler option '{0}'",
        Expected_0_arguments_to_message_got_1_instead: "Expected {0} arguments to message, got {1} instead.",
        Expected_the_message_0_to_have_1_arguments_but_it_had_2: "Expected the message '{0}' to have {1} arguments, but it had {2}",
        Could_not_delete_file_0: "Could not delete file '{0}'",
        Could_not_create_directory_0: "Could not create directory '{0}'",
        Error_while_executing_file_0: "Error while executing file '{0}': ",
        Cannot_compile_external_modules_unless_the_module_flag_is_provided: "Cannot compile external modules unless the '--module' flag is provided.",
        Option_mapRoot_cannot_be_specified_without_specifying_sourcemap_option: "Option mapRoot cannot be specified without specifying sourcemap option.",
        Option_sourceRoot_cannot_be_specified_without_specifying_sourcemap_option: "Option sourceRoot cannot be specified without specifying sourcemap option.",
        Options_mapRoot_and_sourceRoot_cannot_be_specified_without_specifying_sourcemap_option: "Options mapRoot and sourceRoot cannot be specified without specifying sourcemap option.",
        Option_0_specified_without_1: "Option '{0}' specified without '{1}'",
        codepage_option_not_supported_on_current_platform: "'codepage' option not supported on current platform.",
        Concatenate_and_emit_output_to_single_file: "Concatenate and emit output to single file.",
        Generates_corresponding_0_file: "Generates corresponding {0} file.",
        Specifies_the_location_where_debugger_should_locate_map_files_instead_of_generated_locations: "Specifies the location where debugger should locate map files instead of generated locations.",
        Specifies_the_location_where_debugger_should_locate_TypeScript_files_instead_of_source_locations: "Specifies the location where debugger should locate TypeScript files instead of source locations.",
        Watch_input_files: "Watch input files.",
        Redirect_output_structure_to_the_directory: "Redirect output structure to the directory.",
        Do_not_emit_comments_to_output: "Do not emit comments to output.",
        Skip_resolution_and_preprocessing: "Skip resolution and preprocessing.",
        Specify_ECMAScript_target_version_0_default_or_1: "Specify ECMAScript target version: '{0}' (default), or '{1}'",
        Specify_module_code_generation_0_or_1: "Specify module code generation: '{0}' or '{1}'",
        Print_this_message: "Print this message.",
        Print_the_compiler_s_version_0: "Print the compiler's version: {0}",
        Allow_use_of_deprecated_0_keyword_when_referencing_an_external_module: "Allow use of deprecated '{0}' keyword when referencing an external module.",
        Specify_locale_for_errors_and_messages_For_example_0_or_1: "Specify locale for errors and messages. For example '{0}' or '{1}'",
        Syntax_0: "Syntax:   {0}",
        options: "options",
        file1: "file",
        Examples: "Examples:",
        Options: "Options:",
        Insert_command_line_options_and_files_from_a_file: "Insert command line options and files from a file.",
        Version_0: "Version {0}",
        Use_the_0_flag_to_see_options: "Use the '{0}' flag to see options.",
        NL_Recompiling_0: "{NL}Recompiling ({0}):",
        STRING: "STRING",
        KIND: "KIND",
        file2: "FILE",
        VERSION: "VERSION",
        LOCATION: "LOCATION",
        DIRECTORY: "DIRECTORY",
        NUMBER: "NUMBER",
        Specify_the_codepage_to_use_when_opening_source_files: "Specify the codepage to use when opening source files.",
        Additional_locations: "Additional locations:",
        This_version_of_the_Javascript_runtime_does_not_support_the_0_function: "This version of the Javascript runtime does not support the '{0}' function.",
        Unknown_rule: "Unknown rule.",
        Invalid_line_number_0: "Invalid line number ({0})",
        Warn_on_expressions_and_declarations_with_an_implied_any_type: "Warn on expressions and declarations with an implied 'any' type.",
        Variable_0_implicitly_has_an_any_type: "Variable '{0}' implicitly has an 'any' type.",
        Parameter_0_of_1_implicitly_has_an_any_type: "Parameter '{0}' of '{1}' implicitly has an 'any' type.",
        Parameter_0_of_function_type_implicitly_has_an_any_type: "Parameter '{0}' of function type implicitly has an 'any' type.",
        Member_0_of_object_type_implicitly_has_an_any_type: "Member '{0}' of object type implicitly has an 'any' type.",
        new_expression_which_lacks_a_constructor_signature_implicitly_has_an_any_type: "'new' expression, which lacks a constructor signature, implicitly has an 'any' type.",
        _0_which_lacks_return_type_annotation_implicitly_has_an_any_return_type: "'{0}', which lacks return-type annotation, implicitly has an 'any' return type.",
        Function_expression_which_lacks_return_type_annotation_implicitly_has_an_any_return_type: "Function expression, which lacks return-type annotation, implicitly has an 'any' return type.",
        Parameter_0_of_lambda_function_implicitly_has_an_any_type: "Parameter '{0}' of lambda function implicitly has an 'any' type.",
        Constructor_signature_which_lacks_return_type_annotation_implicitly_has_an_any_return_type: "Constructor signature, which lacks return-type annotation, implicitly has an 'any' return type.",
        Lambda_Function_which_lacks_return_type_annotation_implicitly_has_an_any_return_type: "Lambda Function, which lacks return-type annotation, implicitly has an 'any' return type.",
        Array_Literal_implicitly_has_an_any_type_from_widening: "Array Literal implicitly has an 'any' type from widening.",
        _0_which_lacks_get_accessor_and_parameter_type_annotation_on_set_accessor_implicitly_has_an_any_type: "'{0}', which lacks 'get' accessor and parameter type annotation on 'set' accessor, implicitly has an 'any' type.",
        Index_signature_of_object_type_implicitly_has_an_any_type: "Index signature of object type implicitly has an 'any' type.",
        Object_literal_s_property_0_implicitly_has_an_any_type_from_widening: "Object literal's property '{0}' implicitly has an 'any' type from widening.",
        You_must_rename_an_identifier: "You must rename an identifier.",
        You_cannot_rename_this_element: "You cannot rename this element."
    };
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    (function (DiagnosticCategory) {
        DiagnosticCategory[DiagnosticCategory["Warning"] = 0] = "Warning";
        DiagnosticCategory[DiagnosticCategory["Error"] = 1] = "Error";
        DiagnosticCategory[DiagnosticCategory["Message"] = 2] = "Message";
        DiagnosticCategory[DiagnosticCategory["NoPrefix"] = 3] = "NoPrefix";
    })(TypeScript.DiagnosticCategory || (TypeScript.DiagnosticCategory = {}));
    var DiagnosticCategory = TypeScript.DiagnosticCategory;
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    TypeScript.diagnosticInformationMap = {
        "error TS{0}: {1}": { "code": 0, "category": 3 /* NoPrefix */ },
        "warning TS{0}: {1}": { "code": 1, "category": 3 /* NoPrefix */ },
        "Unrecognized escape sequence.": { "code": 1000, "category": 1 /* Error */ },
        "Unexpected character {0}.": { "code": 1001, "category": 1 /* Error */ },
        "Missing close quote character.": { "code": 1002, "category": 1 /* Error */ },
        "Identifier expected.": { "code": 1003, "category": 1 /* Error */ },
        "'{0}' keyword expected.": { "code": 1004, "category": 1 /* Error */ },
        "'{0}' expected.": { "code": 1005, "category": 1 /* Error */ },
        "Identifier expected; '{0}' is a keyword.": { "code": 1006, "category": 1 /* Error */ },
        "Automatic semicolon insertion not allowed.": { "code": 1007, "category": 1 /* Error */ },
        "Unexpected token; '{0}' expected.": { "code": 1008, "category": 1 /* Error */ },
        "Trailing comma not allowed.": { "code": 1009, "category": 1 /* Error */ },
        "'*/' expected.": { "code": 1010, "category": 1 /* Error */ },
        "'public' or 'private' modifier must precede 'static'.": { "code": 1011, "category": 1 /* Error */ },
        "Unexpected token.": { "code": 1012, "category": 1 /* Error */ },
        "Catch clause parameter cannot have a type annotation.": { "code": 1013, "category": 1 /* Error */ },
        "A rest parameter must be last in a parameter list.": { "code": 1014, "category": 1 /* Error */ },
        "Parameter cannot have question mark and initializer.": { "code": 1015, "category": 1 /* Error */ },
        "A required parameter cannot follow an optional parameter.": { "code": 1016, "category": 1 /* Error */ },
        "Index signatures cannot have rest parameters.": { "code": 1017, "category": 1 /* Error */ },
        "Index signature parameter cannot have accessibility modifiers.": { "code": 1018, "category": 1 /* Error */ },
        "Index signature parameter cannot have a question mark.": { "code": 1019, "category": 1 /* Error */ },
        "Index signature parameter cannot have an initializer.": { "code": 1020, "category": 1 /* Error */ },
        "Index signature must have a type annotation.": { "code": 1021, "category": 1 /* Error */ },
        "Index signature parameter must have a type annotation.": { "code": 1022, "category": 1 /* Error */ },
        "Index signature parameter type must be 'string' or 'number'.": { "code": 1023, "category": 1 /* Error */ },
        "'extends' clause already seen.": { "code": 1024, "category": 1 /* Error */ },
        "'extends' clause must precede 'implements' clause.": { "code": 1025, "category": 1 /* Error */ },
        "Classes can only extend a single class.": { "code": 1026, "category": 1 /* Error */ },
        "'implements' clause already seen.": { "code": 1027, "category": 1 /* Error */ },
        "Accessibility modifier already seen.": { "code": 1028, "category": 1 /* Error */ },
        "'{0}' modifier must precede '{1}' modifier.": { "code": 1029, "category": 1 /* Error */ },
        "'{0}' modifier already seen.": { "code": 1030, "category": 1 /* Error */ },
        "'{0}' modifier cannot appear on a class element.": { "code": 1031, "category": 1 /* Error */ },
        "Interface declaration cannot have 'implements' clause.": { "code": 1032, "category": 1 /* Error */ },
        "'super' invocation cannot have type arguments.": { "code": 1034, "category": 1 /* Error */ },
        "Only ambient modules can use quoted names.": { "code": 1035, "category": 1 /* Error */ },
        "Statements are not allowed in ambient contexts.": { "code": 1036, "category": 1 /* Error */ },
        "A function implementation cannot be declared in an ambient context.": { "code": 1037, "category": 1 /* Error */ },
        "A 'declare' modifier cannot be used in an already ambient context.": { "code": 1038, "category": 1 /* Error */ },
        "Initializers are not allowed in ambient contexts.": { "code": 1039, "category": 1 /* Error */ },
        "'{0}' modifier cannot appear on a module element.": { "code": 1044, "category": 1 /* Error */ },
        "A 'declare' modifier cannot be used with an interface declaration.": { "code": 1045, "category": 1 /* Error */ },
        "A 'declare' modifier is required for a top level declaration in a .d.ts file.": { "code": 1046, "category": 1 /* Error */ },
        "A rest parameter cannot be optional.": { "code": 1047, "category": 1 /* Error */ },
        "A rest parameter cannot have an initializer.": { "code": 1048, "category": 1 /* Error */ },
        "'set' accessor must have exactly one parameter.": { "code": 1049, "category": 1 /* Error */ },
        "'set' accessor parameter cannot be optional.": { "code": 1051, "category": 1 /* Error */ },
        "'set' accessor parameter cannot have an initializer.": { "code": 1052, "category": 1 /* Error */ },
        "'set' accessor cannot have rest parameter.": { "code": 1053, "category": 1 /* Error */ },
        "'get' accessor cannot have parameters.": { "code": 1054, "category": 1 /* Error */ },
        "Modifiers cannot appear here.": { "code": 1055, "category": 1 /* Error */ },
        "Accessors are only available when targeting ECMAScript 5 and higher.": { "code": 1056, "category": 1 /* Error */ },
        "Enum member must have initializer.": { "code": 1061, "category": 1 /* Error */ },
        "Export assignment cannot be used in internal modules.": { "code": 1063, "category": 1 /* Error */ },
        "Ambient enum elements can only have integer literal initializers.": { "code": 1066, "category": 1 /* Error */ },
        "module, class, interface, enum, import or statement": { "code": 1067, "category": 3 /* NoPrefix */ },
        "constructor, function, accessor or variable": { "code": 1068, "category": 3 /* NoPrefix */ },
        "statement": { "code": 1069, "category": 3 /* NoPrefix */ },
        "case or default clause": { "code": 1070, "category": 3 /* NoPrefix */ },
        "identifier": { "code": 1071, "category": 3 /* NoPrefix */ },
        "call, construct, index, property or function signature": { "code": 1072, "category": 3 /* NoPrefix */ },
        "expression": { "code": 1073, "category": 3 /* NoPrefix */ },
        "type name": { "code": 1074, "category": 3 /* NoPrefix */ },
        "property or accessor": { "code": 1075, "category": 3 /* NoPrefix */ },
        "parameter": { "code": 1076, "category": 3 /* NoPrefix */ },
        "type": { "code": 1077, "category": 3 /* NoPrefix */ },
        "type parameter": { "code": 1078, "category": 3 /* NoPrefix */ },
        "A 'declare' modifier cannot be used with an import declaration.": { "code": 1079, "category": 1 /* Error */ },
        "Invalid 'reference' directive syntax.": { "code": 1084, "category": 1 /* Error */ },
        "Octal literals are not available when targeting ECMAScript 5 and higher.": { "code": 1085, "category": 1 /* Error */ },
        "Accessors are not allowed in ambient contexts.": { "code": 1086, "category": 1 /* Error */ },
        "'{0}' modifier cannot appear on a constructor declaration.": { "code": 1089, "category": 1 /* Error */ },
        "'{0}' modifier cannot appear on a parameter.": { "code": 1090, "category": 1 /* Error */ },
        "Only a single variable declaration is allowed in a 'for...in' statement.": { "code": 1091, "category": 1 /* Error */ },
        "Type parameters cannot appear on a constructor declaration.": { "code": 1092, "category": 1 /* Error */ },
        "Type annotation cannot appear on a constructor declaration.": { "code": 1093, "category": 1 /* Error */ },
        "Type parameters cannot appear on an accessor.": { "code": 1094, "category": 1 /* Error */ },
        "Type annotation cannot appear on a 'set' accessor.": { "code": 1095, "category": 1 /* Error */ },
        "Index signature must have exactly one parameter.": { "code": 1096, "category": 1 /* Error */ },
        "'{0}' list cannot be empty.": { "code": 1097, "category": 1 /* Error */ },
        "variable declaration": { "code": 1098, "category": 3 /* NoPrefix */ },
        "type argument": { "code": 1099, "category": 3 /* NoPrefix */ },
        "Invalid use of '{0}' in strict mode.": { "code": 1100, "category": 1 /* Error */ },
        "'with' statements are not allowed in strict mode.": { "code": 1101, "category": 1 /* Error */ },
        "'delete' cannot be called on an identifier in strict mode.": { "code": 1102, "category": 1 /* Error */ },
        "Invalid left-hand side in 'for...in' statement.": { "code": 1103, "category": 1 /* Error */ },
        "'continue' statement can only be used within an enclosing iteration statement.": { "code": 1104, "category": 1 /* Error */ },
        "'break' statement can only be used within an enclosing iteration or switch statement.": { "code": 1105, "category": 1 /* Error */ },
        "Jump target not found.": { "code": 1106, "category": 1 /* Error */ },
        "Jump target cannot cross function boundary.": { "code": 1107, "category": 1 /* Error */ },
        "'return' statement must be contained within a function body.": { "code": 1108, "category": 1 /* Error */ },
        "Expression expected.": { "code": 1109, "category": 1 /* Error */ },
        "Type expected.": { "code": 1110, "category": 1 /* Error */ },
        "Duplicate identifier '{0}'.": { "code": 2000, "category": 1 /* Error */ },
        "The name '{0}' does not exist in the current scope.": { "code": 2001, "category": 1 /* Error */ },
        "The name '{0}' does not refer to a value.": { "code": 2002, "category": 1 /* Error */ },
        "'super' can only be used inside a class instance method.": { "code": 2003, "category": 1 /* Error */ },
        "The left-hand side of an assignment expression must be a variable, property or indexer.": { "code": 2004, "category": 1 /* Error */ },
        "Value of type '{0}' is not callable. Did you mean to include 'new'?": { "code": 2161, "category": 1 /* Error */ },
        "Value of type '{0}' is not callable.": { "code": 2006, "category": 1 /* Error */ },
        "Value of type '{0}' is not newable.": { "code": 2007, "category": 1 /* Error */ },
        "An index expression argument must be 'string', 'number', or 'any'.": { "code": 2008, "category": 1 /* Error */ },
        "Operator '{0}' cannot be applied to types '{1}' and '{2}'.": { "code": 2009, "category": 1 /* Error */ },
        "Type '{0}' is not assignable to type '{1}'.": { "code": 2011, "category": 1 /* Error */ },
        "Type '{0}' is not assignable to type '{1}':{NL}{2}": { "code": 2012, "category": 1 /* Error */ },
        "Expected var, class, interface, or module.": { "code": 2013, "category": 1 /* Error */ },
        "Getter '{0}' already declared.": { "code": 2015, "category": 1 /* Error */ },
        "Setter '{0}' already declared.": { "code": 2016, "category": 1 /* Error */ },
        "Exported class '{0}' extends private class '{1}'.": { "code": 2018, "category": 1 /* Error */ },
        "Exported class '{0}' implements private interface '{1}'.": { "code": 2019, "category": 1 /* Error */ },
        "Exported interface '{0}' extends private interface '{1}'.": { "code": 2020, "category": 1 /* Error */ },
        "Exported class '{0}' extends class from inaccessible module {1}.": { "code": 2021, "category": 1 /* Error */ },
        "Exported class '{0}' implements interface from inaccessible module {1}.": { "code": 2022, "category": 1 /* Error */ },
        "Exported interface '{0}' extends interface from inaccessible module {1}.": { "code": 2023, "category": 1 /* Error */ },
        "Public static property '{0}' of exported class has or is using private type '{1}'.": { "code": 2024, "category": 1 /* Error */ },
        "Public property '{0}' of exported class has or is using private type '{1}'.": { "code": 2025, "category": 1 /* Error */ },
        "Property '{0}' of exported interface has or is using private type '{1}'.": { "code": 2026, "category": 1 /* Error */ },
        "Exported variable '{0}' has or is using private type '{1}'.": { "code": 2027, "category": 1 /* Error */ },
        "Public static property '{0}' of exported class is using inaccessible module {1}.": { "code": 2028, "category": 1 /* Error */ },
        "Public property '{0}' of exported class is using inaccessible module {1}.": { "code": 2029, "category": 1 /* Error */ },
        "Property '{0}' of exported interface is using inaccessible module {1}.": { "code": 2030, "category": 1 /* Error */ },
        "Exported variable '{0}' is using inaccessible module {1}.": { "code": 2031, "category": 1 /* Error */ },
        "Parameter '{0}' of constructor from exported class has or is using private type '{1}'.": { "code": 2032, "category": 1 /* Error */ },
        "Parameter '{0}' of public static property setter from exported class has or is using private type '{1}'.": { "code": 2033, "category": 1 /* Error */ },
        "Parameter '{0}' of public property setter from exported class has or is using private type '{1}'.": { "code": 2034, "category": 1 /* Error */ },
        "Parameter '{0}' of constructor signature from exported interface has or is using private type '{1}'.": { "code": 2035, "category": 1 /* Error */ },
        "Parameter '{0}' of call signature from exported interface has or is using private type '{1}'.": { "code": 2036, "category": 1 /* Error */ },
        "Parameter '{0}' of public static method from exported class has or is using private type '{1}'.": { "code": 2037, "category": 1 /* Error */ },
        "Parameter '{0}' of public method from exported class has or is using private type '{1}'.": { "code": 2038, "category": 1 /* Error */ },
        "Parameter '{0}' of method from exported interface has or is using private type '{1}'.": { "code": 2039, "category": 1 /* Error */ },
        "Parameter '{0}' of exported function has or is using private type '{1}'.": { "code": 2040, "category": 1 /* Error */ },
        "Parameter '{0}' of constructor from exported class is using inaccessible module {1}.": { "code": 2041, "category": 1 /* Error */ },
        "Parameter '{0}' of public static property setter from exported class is using inaccessible module {1}.": { "code": 2042, "category": 1 /* Error */ },
        "Parameter '{0}' of public property setter from exported class is using inaccessible module {1}.": { "code": 2043, "category": 1 /* Error */ },
        "Parameter '{0}' of constructor signature from exported interface is using inaccessible module {1}.": { "code": 2044, "category": 1 /* Error */ },
        "Parameter '{0}' of call signature from exported interface is using inaccessible module {1}": { "code": 2045, "category": 1 /* Error */ },
        "Parameter '{0}' of public static method from exported class is using inaccessible module {1}.": { "code": 2046, "category": 1 /* Error */ },
        "Parameter '{0}' of public method from exported class is using inaccessible module {1}.": { "code": 2047, "category": 1 /* Error */ },
        "Parameter '{0}' of method from exported interface is using inaccessible module {1}.": { "code": 2048, "category": 1 /* Error */ },
        "Parameter '{0}' of exported function is using inaccessible module {1}.": { "code": 2049, "category": 1 /* Error */ },
        "Return type of public static property getter from exported class has or is using private type '{0}'.": { "code": 2050, "category": 1 /* Error */ },
        "Return type of public property getter from exported class has or is using private type '{0}'.": { "code": 2051, "category": 1 /* Error */ },
        "Return type of constructor signature from exported interface has or is using private type '{0}'.": { "code": 2052, "category": 1 /* Error */ },
        "Return type of call signature from exported interface has or is using private type '{0}'.": { "code": 2053, "category": 1 /* Error */ },
        "Return type of index signature from exported interface has or is using private type '{0}'.": { "code": 2054, "category": 1 /* Error */ },
        "Return type of public static method from exported class has or is using private type '{0}'.": { "code": 2055, "category": 1 /* Error */ },
        "Return type of public method from exported class has or is using private type '{0}'.": { "code": 2056, "category": 1 /* Error */ },
        "Return type of method from exported interface has or is using private type '{0}'.": { "code": 2057, "category": 1 /* Error */ },
        "Return type of exported function has or is using private type '{0}'.": { "code": 2058, "category": 1 /* Error */ },
        "Return type of public static property getter from exported class is using inaccessible module {0}.": { "code": 2059, "category": 1 /* Error */ },
        "Return type of public property getter from exported class is using inaccessible module {0}.": { "code": 2060, "category": 1 /* Error */ },
        "Return type of constructor signature from exported interface is using inaccessible module {0}.": { "code": 2061, "category": 1 /* Error */ },
        "Return type of call signature from exported interface is using inaccessible module {0}.": { "code": 2062, "category": 1 /* Error */ },
        "Return type of index signature from exported interface is using inaccessible module {0}.": { "code": 2063, "category": 1 /* Error */ },
        "Return type of public static method from exported class is using inaccessible module {0}.": { "code": 2064, "category": 1 /* Error */ },
        "Return type of public method from exported class is using inaccessible module {0}.": { "code": 2065, "category": 1 /* Error */ },
        "Return type of method from exported interface is using inaccessible module {0}.": { "code": 2066, "category": 1 /* Error */ },
        "Return type of exported function is using inaccessible module {0}.": { "code": 2067, "category": 1 /* Error */ },
        "'new T[]' cannot be used to create an array. Use 'new Array<T>()' instead.": { "code": 2068, "category": 1 /* Error */ },
        "A parameter list must follow a generic type argument list. '(' expected.": { "code": 2069, "category": 1 /* Error */ },
        "Multiple constructor implementations are not allowed.": { "code": 2070, "category": 1 /* Error */ },
        "Cannot find external module '{0}'.": { "code": 2071, "category": 1 /* Error */ },
        "Module cannot be aliased to a non-module type.": { "code": 2072, "category": 1 /* Error */ },
        "A class may only extend another class.": { "code": 2073, "category": 1 /* Error */ },
        "A class may only implement another class or interface.": { "code": 2074, "category": 1 /* Error */ },
        "An interface may only extend a class or another interface.": { "code": 2075, "category": 1 /* Error */ },
        "Unable to resolve type.": { "code": 2077, "category": 1 /* Error */ },
        "Unable to resolve type of '{0}'.": { "code": 2078, "category": 1 /* Error */ },
        "Unable to resolve type parameter constraint.": { "code": 2079, "category": 1 /* Error */ },
        "Type parameter constraint cannot be a primitive type.": { "code": 2080, "category": 1 /* Error */ },
        "Supplied parameters do not match any signature of call target.": { "code": 2081, "category": 1 /* Error */ },
        "Supplied parameters do not match any signature of call target:{NL}{0}": { "code": 2082, "category": 1 /* Error */ },
        "Cannot use 'new' with an expression whose type lacks a signature.": { "code": 2083, "category": 1 /* Error */ },
        "Only a void function can be called with the 'new' keyword.": { "code": 2084, "category": 1 /* Error */ },
        "Could not select overload for 'new' expression.": { "code": 2085, "category": 1 /* Error */ },
        "Type '{0}' does not satisfy the constraint '{1}'.": { "code": 2086, "category": 1 /* Error */ },
        "Could not select overload for 'call' expression.": { "code": 2087, "category": 1 /* Error */ },
        "Cannot invoke an expression whose type lacks a call signature.": { "code": 2088, "category": 1 /* Error */ },
        "Calls to 'super' are only valid inside a class.": { "code": 2089, "category": 1 /* Error */ },
        "Generic type '{0}' requires {1} type argument(s).": { "code": 2090, "category": 1 /* Error */ },
        "Type of array literal cannot be determined. Best common type could not be found for array elements.": { "code": 2092, "category": 1 /* Error */ },
        "Could not find enclosing symbol for dotted name '{0}'.": { "code": 2093, "category": 1 /* Error */ },
        "Property '{0}' does not exist on value of type '{1}'.": { "code": 2094, "category": 1 /* Error */ },
        "Cannot find name '{0}'.": { "code": 2095, "category": 1 /* Error */ },
        "'get' and 'set' accessor must have the same type.": { "code": 2096, "category": 1 /* Error */ },
        "'this' cannot be referenced in current location.": { "code": 2097, "category": 1 /* Error */ },
        "Static members cannot reference class type parameters.": { "code": 2099, "category": 1 /* Error */ },
        "Type '{0}' recursively references itself as a base type.": { "code": 2100, "category": 1 /* Error */ },
        "'super' property access is permitted only in a constructor, member function, or member accessor of a derived class.": { "code": 2102, "category": 1 /* Error */ },
        "'super' can only be referenced in a derived class.": { "code": 2103, "category": 1 /* Error */ },
        "A 'super' call must be the first statement in the constructor when a class contains initialized properties or has parameter properties.": { "code": 2104, "category": 1 /* Error */ },
        "Constructors for derived classes must contain a 'super' call.": { "code": 2105, "category": 1 /* Error */ },
        "Super calls are not permitted outside constructors or in nested functions inside constructors.": { "code": 2106, "category": 1 /* Error */ },
        "'{0}.{1}' is inaccessible.": { "code": 2107, "category": 1 /* Error */ },
        "'this' cannot be referenced in a module body.": { "code": 2108, "category": 1 /* Error */ },
        "Invalid '+' expression - types not known to support the addition operator.": { "code": 2111, "category": 1 /* Error */ },
        "The right-hand side of an arithmetic operation must be of type 'any', 'number' or an enum type.": { "code": 2112, "category": 1 /* Error */ },
        "The left-hand side of an arithmetic operation must be of type 'any', 'number' or an enum type.": { "code": 2113, "category": 1 /* Error */ },
        "An arithmetic operand must be of type 'any', 'number' or an enum type.": { "code": 2114, "category": 1 /* Error */ },
        "Variable declarations of a 'for' statement cannot use a type annotation.": { "code": 2115, "category": 1 /* Error */ },
        "Variable declarations of a 'for' statement must be of types 'string' or 'any'.": { "code": 2116, "category": 1 /* Error */ },
        "The right-hand side of a 'for...in' statement must be of type 'any', an object type or a type parameter.": { "code": 2117, "category": 1 /* Error */ },
        "The left-hand side of an 'in' expression must be of types 'any', 'string' or 'number'.": { "code": 2118, "category": 1 /* Error */ },
        "The right-hand side of an 'in' expression must be of type 'any', an object type or a type parameter.": { "code": 2119, "category": 1 /* Error */ },
        "The left-hand side of an 'instanceof' expression must be of type 'any', an object type or a type parameter.": { "code": 2120, "category": 1 /* Error */ },
        "The right-hand side of an 'instanceof' expression must be of type 'any' or of a type assignable to the 'Function' interface type.": { "code": 2121, "category": 1 /* Error */ },
        "Setters cannot return a value.": { "code": 2122, "category": 1 /* Error */ },
        "Tried to query type of uninitialized module '{0}'.": { "code": 2123, "category": 1 /* Error */ },
        "Tried to set variable type to uninitialized module type '{0}'.": { "code": 2124, "category": 1 /* Error */ },
        "Type '{0}' is not generic.": { "code": 2125, "category": 1 /* Error */ },
        "Getters must return a value.": { "code": 2126, "category": 1 /* Error */ },
        "Getter and setter accessors do not agree in visibility.": { "code": 2127, "category": 1 /* Error */ },
        "Invalid left-hand side of assignment expression.": { "code": 2130, "category": 1 /* Error */ },
        "Function declared a non-void return type, but has no return expression.": { "code": 2131, "category": 1 /* Error */ },
        "Cannot resolve return type reference.": { "code": 2132, "category": 1 /* Error */ },
        "Constructors cannot have a return type of 'void'.": { "code": 2133, "category": 1 /* Error */ },
        "Subsequent variable declarations must have the same type.  Variable '{0}' must be of type '{1}', but here has type '{2}'.": { "code": 2134, "category": 1 /* Error */ },
        "All symbols within a with block will be resolved to 'any'.": { "code": 2135, "category": 1 /* Error */ },
        "Import declarations in an internal module cannot reference an external module.": { "code": 2136, "category": 1 /* Error */ },
        "Class {0} declares interface {1} but does not implement it:{NL}{2}": { "code": 2137, "category": 1 /* Error */ },
        "Class {0} declares class {1} as an interface but does not implement it:{NL}{2}": { "code": 2138, "category": 1 /* Error */ },
        "The operand of an increment or decrement operator must be a variable, property or indexer.": { "code": 2139, "category": 1 /* Error */ },
        "'this' cannot be referenced in a static property initializer.": { "code": 2140, "category": 1 /* Error */ },
        "Class '{0}' cannot extend class '{1}':{NL}{2}": { "code": 2141, "category": 1 /* Error */ },
        "Interface '{0}' cannot extend class '{1}':{NL}{2}": { "code": 2142, "category": 1 /* Error */ },
        "Interface '{0}' cannot extend interface '{1}':{NL}{2}": { "code": 2143, "category": 1 /* Error */ },
        "Overload signature is not compatible with function definition.": { "code": 2148, "category": 1 /* Error */ },
        "Overload signature is not compatible with function definition:{NL}{0}": { "code": 2149, "category": 1 /* Error */ },
        "Overload signatures must all be public or private.": { "code": 2150, "category": 1 /* Error */ },
        "Overload signatures must all be exported or not exported.": { "code": 2151, "category": 1 /* Error */ },
        "Overload signatures must all be ambient or non-ambient.": { "code": 2152, "category": 1 /* Error */ },
        "Overload signatures must all be optional or required.": { "code": 2153, "category": 1 /* Error */ },
        "Specialized overload signature is not assignable to any non-specialized signature.": { "code": 2154, "category": 1 /* Error */ },
        "'this' cannot be referenced in constructor arguments.": { "code": 2155, "category": 1 /* Error */ },
        "Instance member cannot be accessed off a class.": { "code": 2157, "category": 1 /* Error */ },
        "Untyped function calls may not accept type arguments.": { "code": 2158, "category": 1 /* Error */ },
        "Non-generic functions may not accept type arguments.": { "code": 2159, "category": 1 /* Error */ },
        "A generic type may not reference itself with a wrapped form of its own type parameters.": { "code": 2160, "category": 1 /* Error */ },
        "A rest parameter must be of an array type.": { "code": 2162, "category": 1 /* Error */ },
        "Overload signature implementation cannot use specialized type.": { "code": 2163, "category": 1 /* Error */ },
        "Export assignments may only be used at the top-level of external modules.": { "code": 2164, "category": 1 /* Error */ },
        "Export assignments may only be made with variables, functions, classes, interfaces, enums and internal modules.": { "code": 2165, "category": 1 /* Error */ },
        "Only public methods of the base class are accessible via the 'super' keyword.": { "code": 2166, "category": 1 /* Error */ },
        "Numeric indexer type '{0}' must be assignable to string indexer type '{1}'.": { "code": 2167, "category": 1 /* Error */ },
        "Numeric indexer type '{0}' must be assignable to string indexer type '{1}':{NL}{2}": { "code": 2168, "category": 1 /* Error */ },
        "All numerically named properties must be assignable to numeric indexer type '{0}'.": { "code": 2169, "category": 1 /* Error */ },
        "All numerically named properties must be assignable to numeric indexer type '{0}':{NL}{1}": { "code": 2170, "category": 1 /* Error */ },
        "All named properties must be assignable to string indexer type '{0}'.": { "code": 2171, "category": 1 /* Error */ },
        "All named properties must be assignable to string indexer type '{0}':{NL}{1}": { "code": 2172, "category": 1 /* Error */ },
        "A parameter initializer is only allowed in a function or constructor implementation.": { "code": 2174, "category": 1 /* Error */ },
        "Function expression declared a non-void return type, but has no return expression.": { "code": 2176, "category": 1 /* Error */ },
        "Import declaration referencing identifier from internal module can only be made with variables, functions, classes, interfaces, enums and internal modules.": { "code": 2177, "category": 1 /* Error */ },
        "Module '{0}' has no exported member '{1}'.": { "code": 2178, "category": 1 /* Error */ },
        "Unable to resolve module reference '{0}'.": { "code": 2179, "category": 1 /* Error */ },
        "Could not find module '{0}' in module '{1}'.": { "code": 2180, "category": 1 /* Error */ },
        "Exported import declaration '{0}' is assigned value with type that has or is using private type '{1}'.": { "code": 2181, "category": 1 /* Error */ },
        "Exported import declaration '{0}' is assigned value with type that is using inaccessible module '{1}'.": { "code": 2182, "category": 1 /* Error */ },
        "Exported import declaration '{0}' is assigned type that has or is using private type '{1}'.": { "code": 2183, "category": 1 /* Error */ },
        "Exported import declaration '{0}' is assigned type that is using inaccessible module '{1}'.": { "code": 2184, "category": 1 /* Error */ },
        "Exported import declaration '{0}' is assigned container that is or is using inaccessible module '{1}'.": { "code": 2185, "category": 1 /* Error */ },
        "Type name '{0}' in extends clause does not reference constructor function for '{1}'.": { "code": 2186, "category": 1 /* Error */ },
        "Internal module reference '{0}' in import declaration does not reference module instance for '{1}'.": { "code": 2187, "category": 1 /* Error */ },
        "Module '{0}' cannot merge with previous declaration of '{1}' in a different file '{2}'.": { "code": 2188, "category": 1 /* Error */ },
        "Interface '{0}' cannot simultaneously extend types '{1}' and '{2}':{NL}{3}": { "code": 2189, "category": 1 /* Error */ },
        "Initializer of parameter '{0}' cannot reference identifier '{1}' declared after it.": { "code": 2190, "category": 1 /* Error */ },
        "Ambient external module declaration cannot be reopened.": { "code": 2191, "category": 1 /* Error */ },
        "All declarations of merged declaration '{0}' must be exported or not exported.": { "code": 2192, "category": 1 /* Error */ },
        "'super' cannot be referenced in constructor arguments.": { "code": 2193, "category": 1 /* Error */ },
        "Return type of constructor signature must be assignable to the instance type of the class.": { "code": 2194, "category": 1 /* Error */ },
        "Ambient external module declaration must be defined in global context.": { "code": 2195, "category": 1 /* Error */ },
        "Ambient external module declaration cannot specify relative module name.": { "code": 2196, "category": 1 /* Error */ },
        "Import declaration in an ambient external module declaration cannot reference external module through relative external module name.": { "code": 2197, "category": 1 /* Error */ },
        "No best common type exists among return expressions.": { "code": 2198, "category": 1 /* Error */ },
        "Import declaration cannot refer to external module reference when --noResolve option is set.": { "code": 2199, "category": 1 /* Error */ },
        "Duplicate identifier '_this'. Compiler uses variable declaration '_this' to capture 'this' reference.": { "code": 2200, "category": 1 /* Error */ },
        "Duplicate identifier '_super'. Compiler uses '_super' to capture base class reference.": { "code": 2205, "category": 1 /* Error */ },
        "Expression resolves to variable declaration '_this' that compiler uses to capture 'this' reference.": { "code": 2206, "category": 1 /* Error */ },
        "Expression resolves to '_super' that compiler uses to capture base class reference.": { "code": 2207, "category": 1 /* Error */ },
        "TypeParameter '{0}' of constructor signature from exported interface has or is using private type '{1}'.": { "code": 2208, "category": 1 /* Error */ },
        "TypeParameter '{0}' of call signature from exported interface has or is using private type '{1}'.": { "code": 2209, "category": 1 /* Error */ },
        "TypeParameter '{0}' of public static method from exported class has or is using private type '{1}'.": { "code": 2210, "category": 1 /* Error */ },
        "TypeParameter '{0}' of public method from exported class has or is using private type '{1}'.": { "code": 2211, "category": 1 /* Error */ },
        "TypeParameter '{0}' of method from exported interface has or is using private type '{1}'.": { "code": 2212, "category": 1 /* Error */ },
        "TypeParameter '{0}' of exported function has or is using private type '{1}'.": { "code": 2213, "category": 1 /* Error */ },
        "TypeParameter '{0}' of constructor signature from exported interface is using inaccessible module {1}.": { "code": 2214, "category": 1 /* Error */ },
        "TypeParameter '{0}' of call signature from exported interface is using inaccessible module {1}": { "code": 2215, "category": 1 /* Error */ },
        "TypeParameter '{0}' of public static method from exported class is using inaccessible module {1}.": { "code": 2216, "category": 1 /* Error */ },
        "TypeParameter '{0}' of public method from exported class is using inaccessible module {1}.": { "code": 2217, "category": 1 /* Error */ },
        "TypeParameter '{0}' of method from exported interface is using inaccessible module {1}.": { "code": 2218, "category": 1 /* Error */ },
        "TypeParameter '{0}' of exported function is using inaccessible module {1}.": { "code": 2219, "category": 1 /* Error */ },
        "TypeParameter '{0}' of exported class has or is using private type '{1}'.": { "code": 2220, "category": 1 /* Error */ },
        "TypeParameter '{0}' of exported interface has or is using private type '{1}'.": { "code": 2221, "category": 1 /* Error */ },
        "TypeParameter '{0}' of exported class is using inaccessible module {1}.": { "code": 2222, "category": 1 /* Error */ },
        "TypeParameter '{0}' of exported interface is using inaccessible module {1}.": { "code": 2223, "category": 1 /* Error */ },
        "Duplicate identifier '_i'. Compiler uses '_i' to initialize rest parameter.": { "code": 2224, "category": 1 /* Error */ },
        "Duplicate identifier 'arguments'. Compiler uses 'arguments' to initialize rest parameters.": { "code": 2225, "category": 1 /* Error */ },
        "No best common type exists between '{0}' and '{1}'.": { "code": 2226, "category": 1 /* Error */ },
        "No best common type exists between '{0}', '{1}', and '{2}'.": { "code": 2227, "category": 1 /* Error */ },
        "Duplicate identifier '{0}'. Compiler reserves name '{1}' in top level scope of an external module.": { "code": 2228, "category": 1 /* Error */ },
        "Constraint of a type parameter cannot reference any type parameter from the same type parameter list.": { "code": 2229, "category": 1 /* Error */ },
        "Initializer of instance member variable '{0}' cannot reference identifier '{1}' declared in the constructor.": { "code": 2230, "category": 1 /* Error */ },
        "Parameter '{0}' cannot be referenced in its initializer.": { "code": 2231, "category": 1 /* Error */ },
        "Duplicate string index signature.": { "code": 2232, "category": 1 /* Error */ },
        "Duplicate number index signature.": { "code": 2233, "category": 1 /* Error */ },
        "All declarations of an interface must have identical type parameters.": { "code": 2234, "category": 1 /* Error */ },
        "Expression resolves to variable declaration '_i' that compiler uses to initialize rest parameter.": { "code": 2235, "category": 1 /* Error */ },
        "Neither type '{0}' nor type '{1}' is assignable to the other.": { "code": 2236, "category": 1 /* Error */ },
        "Neither type '{0}' nor type '{1}' is assignable to the other:{NL}{2}": { "code": 2237, "category": 1 /* Error */ },
        "Duplicate function implementation.": { "code": 2237, "category": 1 /* Error */ },
        "Function implementation expected.": { "code": 2238, "category": 1 /* Error */ },
        "Function overload name must be '{0}'.": { "code": 2239, "category": 1 /* Error */ },
        "Constructor implementation expected.": { "code": 2240, "category": 1 /* Error */ },
        "Class name cannot be '{0}'.": { "code": 2241, "category": 1 /* Error */ },
        "Interface name cannot be '{0}'.": { "code": 2242, "category": 1 /* Error */ },
        "Enum name cannot be '{0}'.": { "code": 2243, "category": 1 /* Error */ },
        "A module cannot have multiple export assignments.": { "code": 2244, "category": 1 /* Error */ },
        "Export assignment not allowed in module with exported element.": { "code": 2245, "category": 1 /* Error */ },
        "A parameter property is only allowed in a constructor implementation.": { "code": 2246, "category": 1 /* Error */ },
        "Function overload must be static.": { "code": 2247, "category": 1 /* Error */ },
        "Function overload must not be static.": { "code": 2248, "category": 1 /* Error */ },
        "Type '{0}' is missing property '{1}' from type '{2}'.": { "code": 4000, "category": 3 /* NoPrefix */ },
        "Types of property '{0}' of types '{1}' and '{2}' are incompatible.": { "code": 4001, "category": 3 /* NoPrefix */ },
        "Types of property '{0}' of types '{1}' and '{2}' are incompatible:{NL}{3}": { "code": 4002, "category": 3 /* NoPrefix */ },
        "Property '{0}' defined as private in type '{1}' is defined as public in type '{2}'.": { "code": 4003, "category": 3 /* NoPrefix */ },
        "Property '{0}' defined as public in type '{1}' is defined as private in type '{2}'.": { "code": 4004, "category": 3 /* NoPrefix */ },
        "Types '{0}' and '{1}' define property '{2}' as private.": { "code": 4005, "category": 3 /* NoPrefix */ },
        "Call signatures of types '{0}' and '{1}' are incompatible.": { "code": 4006, "category": 3 /* NoPrefix */ },
        "Call signatures of types '{0}' and '{1}' are incompatible:{NL}{2}": { "code": 4007, "category": 3 /* NoPrefix */ },
        "Type '{0}' requires a call signature, but type '{1}' lacks one.": { "code": 4008, "category": 3 /* NoPrefix */ },
        "Construct signatures of types '{0}' and '{1}' are incompatible.": { "code": 4009, "category": 3 /* NoPrefix */ },
        "Construct signatures of types '{0}' and '{1}' are incompatible:{NL}{2}": { "code": 4010, "category": 3 /* NoPrefix */ },
        "Type '{0}' requires a construct signature, but type '{1}' lacks one.": { "code": 4011, "category": 3 /* NoPrefix */ },
        "Index signatures of types '{0}' and '{1}' are incompatible.": { "code": 4012, "category": 3 /* NoPrefix */ },
        "Index signatures of types '{0}' and '{1}' are incompatible:{NL}{2}": { "code": 4013, "category": 3 /* NoPrefix */ },
        "Call signature expects {0} or fewer parameters.": { "code": 4014, "category": 3 /* NoPrefix */ },
        "Could not apply type '{0}' to argument {1} which is of type '{2}'.": { "code": 4015, "category": 3 /* NoPrefix */ },
        "Class '{0}' defines instance member accessor '{1}', but extended class '{2}' defines it as instance member function.": { "code": 4016, "category": 3 /* NoPrefix */ },
        "Class '{0}' defines instance member property '{1}', but extended class '{2}' defines it as instance member function.": { "code": 4017, "category": 3 /* NoPrefix */ },
        "Class '{0}' defines instance member function '{1}', but extended class '{2}' defines it as instance member accessor.": { "code": 4018, "category": 3 /* NoPrefix */ },
        "Class '{0}' defines instance member function '{1}', but extended class '{2}' defines it as instance member property.": { "code": 4019, "category": 3 /* NoPrefix */ },
        "Types of static property '{0}' of class '{1}' and class '{2}' are incompatible.": { "code": 4020, "category": 3 /* NoPrefix */ },
        "Types of static property '{0}' of class '{1}' and class '{2}' are incompatible:{NL}{3}": { "code": 4021, "category": 3 /* NoPrefix */ },
        "Type reference cannot refer to container '{0}'.": { "code": 4022, "category": 1 /* Error */ },
        "Type reference must refer to type.": { "code": 4023, "category": 1 /* Error */ },
        "In enums with multiple declarations only one declaration can omit an initializer for the first enum element.": { "code": 4024, "category": 1 /* Error */ },
        " (+ {0} overload(s))": { "code": 4025, "category": 2 /* Message */ },
        "Variable declaration cannot have the same name as an import declaration.": { "code": 4026, "category": 1 /* Error */ },
        "Signature expected {0} type arguments, got {1} instead.": { "code": 4027, "category": 1 /* Error */ },
        "Property '{0}' defined as optional in type '{1}', but is required in type '{2}'.": { "code": 4028, "category": 3 /* NoPrefix */ },
        "Types '{0}' and '{1}' originating in infinitely expanding type reference do not refer to same named type.": { "code": 4029, "category": 3 /* NoPrefix */ },
        "Types '{0}' and '{1}' originating in infinitely expanding type reference have incompatible type arguments.": { "code": 4030, "category": 3 /* NoPrefix */ },
        "Types '{0}' and '{1}' originating in infinitely expanding type reference have incompatible type arguments:{NL}{2}": { "code": 4031, "category": 3 /* NoPrefix */ },
        "Named properties '{0}' of types '{1}' and '{2}' are not identical.": { "code": 4032, "category": 3 /* NoPrefix */ },
        "Types of string indexer of types '{0}' and '{1}' are not identical.": { "code": 4033, "category": 3 /* NoPrefix */ },
        "Types of number indexer of types '{0}' and '{1}' are not identical.": { "code": 4034, "category": 3 /* NoPrefix */ },
        "Type of number indexer in type '{0}' is not assignable to string indexer type in type '{1}'.{NL}{2}": { "code": 4035, "category": 3 /* NoPrefix */ },
        "Type of property '{0}' in type '{1}' is not assignable to string indexer type in type '{2}'.{NL}{3}": { "code": 4036, "category": 3 /* NoPrefix */ },
        "Type of property '{0}' in type '{1}' is not assignable to number indexer type in type '{2}'.{NL}{3}": { "code": 4037, "category": 3 /* NoPrefix */ },
        "Static property '{0}' defined as private in type '{1}' is defined as public in type '{2}'.": { "code": 4038, "category": 3 /* NoPrefix */ },
        "Static property '{0}' defined as public in type '{1}' is defined as private in type '{2}'.": { "code": 4039, "category": 3 /* NoPrefix */ },
        "Types '{0}' and '{1}' define static property '{2}' as private.": { "code": 4040, "category": 3 /* NoPrefix */ },
        "Current host does not support '{0}' option.": { "code": 5001, "category": 1 /* Error */ },
        "ECMAScript target version '{0}' not supported.  Specify a valid target version: '{1}' (default), or '{2}'": { "code": 5002, "category": 1 /* Error */ },
        "Argument for '{0}' option must be '{1}' or '{2}'": { "code": 5003, "category": 1 /* Error */ },
        "Could not find file: '{0}'.": { "code": 5004, "category": 1 /* Error */ },
        "A file cannot have a reference to itself.": { "code": 5006, "category": 1 /* Error */ },
        "Cannot resolve referenced file: '{0}'.": { "code": 5007, "category": 1 /* Error */ },
        "Cannot find the common subdirectory path for the input files.": { "code": 5009, "category": 1 /* Error */ },
        "Emit Error: {0}.": { "code": 5011, "category": 1 /* Error */ },
        "Cannot read file '{0}': {1}": { "code": 5012, "category": 1 /* Error */ },
        "Unsupported file encoding.": { "code": 5013, "category": 3 /* NoPrefix */ },
        "Locale must be of the form <language> or <language>-<territory>. For example '{0}' or '{1}'.": { "code": 5014, "category": 1 /* Error */ },
        "Unsupported locale: '{0}'.": { "code": 5015, "category": 1 /* Error */ },
        "Execution Failed.{NL}": { "code": 5016, "category": 1 /* Error */ },
        "Invalid call to 'up'": { "code": 5019, "category": 1 /* Error */ },
        "Invalid call to 'down'": { "code": 5020, "category": 1 /* Error */ },
        "Base64 value '{0}' finished with a continuation bit.": { "code": 5021, "category": 1 /* Error */ },
        "Unknown compiler option '{0}'": { "code": 5023, "category": 1 /* Error */ },
        "Expected {0} arguments to message, got {1} instead.": { "code": 5024, "category": 1 /* Error */ },
        "Expected the message '{0}' to have {1} arguments, but it had {2}": { "code": 5025, "category": 1 /* Error */ },
        "Could not delete file '{0}'": { "code": 5034, "category": 1 /* Error */ },
        "Could not create directory '{0}'": { "code": 5035, "category": 1 /* Error */ },
        "Error while executing file '{0}': ": { "code": 5036, "category": 1 /* Error */ },
        "Cannot compile external modules unless the '--module' flag is provided.": { "code": 5037, "category": 1 /* Error */ },
        "Option mapRoot cannot be specified without specifying sourcemap option.": { "code": 5038, "category": 1 /* Error */ },
        "Option sourceRoot cannot be specified without specifying sourcemap option.": { "code": 5039, "category": 1 /* Error */ },
        "Options mapRoot and sourceRoot cannot be specified without specifying sourcemap option.": { "code": 5040, "category": 1 /* Error */ },
        "Option '{0}' specified without '{1}'": { "code": 5041, "category": 1 /* Error */ },
        "'codepage' option not supported on current platform.": { "code": 5042, "category": 1 /* Error */ },
        "Concatenate and emit output to single file.": { "code": 6001, "category": 2 /* Message */ },
        "Generates corresponding {0} file.": { "code": 6002, "category": 2 /* Message */ },
        "Specifies the location where debugger should locate map files instead of generated locations.": { "code": 6003, "category": 2 /* Message */ },
        "Specifies the location where debugger should locate TypeScript files instead of source locations.": { "code": 6004, "category": 2 /* Message */ },
        "Watch input files.": { "code": 6005, "category": 2 /* Message */ },
        "Redirect output structure to the directory.": { "code": 6006, "category": 2 /* Message */ },
        "Do not emit comments to output.": { "code": 6009, "category": 2 /* Message */ },
        "Skip resolution and preprocessing.": { "code": 6010, "category": 2 /* Message */ },
        "Specify ECMAScript target version: '{0}' (default), or '{1}'": { "code": 6015, "category": 2 /* Message */ },
        "Specify module code generation: '{0}' or '{1}'": { "code": 6016, "category": 2 /* Message */ },
        "Print this message.": { "code": 6017, "category": 2 /* Message */ },
        "Print the compiler's version: {0}": { "code": 6019, "category": 2 /* Message */ },
        "Allow use of deprecated '{0}' keyword when referencing an external module.": { "code": 6021, "category": 2 /* Message */ },
        "Specify locale for errors and messages. For example '{0}' or '{1}'": { "code": 6022, "category": 2 /* Message */ },
        "Syntax:   {0}": { "code": 6023, "category": 2 /* Message */ },
        "options": { "code": 6024, "category": 2 /* Message */ },
        "file1": { "code": 6025, "category": 2 /* Message */ },
        "Examples:": { "code": 6026, "category": 2 /* Message */ },
        "Options:": { "code": 6027, "category": 2 /* Message */ },
        "Insert command line options and files from a file.": { "code": 6030, "category": 2 /* Message */ },
        "Version {0}": { "code": 6029, "category": 2 /* Message */ },
        "Use the '{0}' flag to see options.": { "code": 6031, "category": 2 /* Message */ },
        "{NL}Recompiling ({0}):": { "code": 6032, "category": 2 /* Message */ },
        "STRING": { "code": 6033, "category": 2 /* Message */ },
        "KIND": { "code": 6034, "category": 2 /* Message */ },
        "file2": { "code": 6035, "category": 2 /* Message */ },
        "VERSION": { "code": 6036, "category": 2 /* Message */ },
        "LOCATION": { "code": 6037, "category": 2 /* Message */ },
        "DIRECTORY": { "code": 6038, "category": 2 /* Message */ },
        "NUMBER": { "code": 6039, "category": 2 /* Message */ },
        "Specify the codepage to use when opening source files.": { "code": 6040, "category": 2 /* Message */ },
        "Additional locations:": { "code": 6041, "category": 2 /* Message */ },
        "This version of the Javascript runtime does not support the '{0}' function.": { "code": 7000, "category": 1 /* Error */ },
        "Unknown rule.": { "code": 7002, "category": 1 /* Error */ },
        "Invalid line number ({0})": { "code": 7003, "category": 1 /* Error */ },
        "Warn on expressions and declarations with an implied 'any' type.": { "code": 7004, "category": 2 /* Message */ },
        "Variable '{0}' implicitly has an 'any' type.": { "code": 7005, "category": 1 /* Error */ },
        "Parameter '{0}' of '{1}' implicitly has an 'any' type.": { "code": 7006, "category": 1 /* Error */ },
        "Parameter '{0}' of function type implicitly has an 'any' type.": { "code": 7007, "category": 1 /* Error */ },
        "Member '{0}' of object type implicitly has an 'any' type.": { "code": 7008, "category": 1 /* Error */ },
        "'new' expression, which lacks a constructor signature, implicitly has an 'any' type.": { "code": 7009, "category": 1 /* Error */ },
        "'{0}', which lacks return-type annotation, implicitly has an 'any' return type.": { "code": 7010, "category": 1 /* Error */ },
        "Function expression, which lacks return-type annotation, implicitly has an 'any' return type.": { "code": 7011, "category": 1 /* Error */ },
        "Parameter '{0}' of lambda function implicitly has an 'any' type.": { "code": 7012, "category": 1 /* Error */ },
        "Constructor signature, which lacks return-type annotation, implicitly has an 'any' return type.": { "code": 7013, "category": 1 /* Error */ },
        "Lambda Function, which lacks return-type annotation, implicitly has an 'any' return type.": { "code": 7014, "category": 1 /* Error */ },
        "Array Literal implicitly has an 'any' type from widening.": { "code": 7015, "category": 1 /* Error */ },
        "'{0}', which lacks 'get' accessor and parameter type annotation on 'set' accessor, implicitly has an 'any' type.": { "code": 7016, "category": 1 /* Error */ },
        "Index signature of object type implicitly has an 'any' type.": { "code": 7017, "category": 1 /* Error */ },
        "Object literal's property '{0}' implicitly has an 'any' type from widening.": { "code": 7018, "category": 1 /* Error */ },
        "You must rename an identifier.": { "code": 8000, "category": 1 /* Error */ },
        "You cannot rename this element.": { "code": 8001, "category": 1 /* Error */ }
    };
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    var ArrayUtilities = (function () {
        function ArrayUtilities() {
        }
        ArrayUtilities.sequenceEquals = function (array1, array2, equals) {
            if (array1 === array2) {
                return true;
            }
            if (array1 === null || array2 === null) {
                return false;
            }
            if (array1.length !== array2.length) {
                return false;
            }
            for (var i = 0, n = array1.length; i < n; i++) {
                if (!equals(array1[i], array2[i])) {
                    return false;
                }
            }
            return true;
        };
        ArrayUtilities.contains = function (array, value) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === value) {
                    return true;
                }
            }
            return false;
        };
        ArrayUtilities.distinct = function (array, equalsFn) {
            var result = [];
            for (var i = 0, n = array.length; i < n; i++) {
                var current = array[i];
                for (var j = 0; j < result.length; j++) {
                    if (equalsFn(result[j], current)) {
                        break;
                    }
                }
                if (j === result.length) {
                    result.push(current);
                }
            }
            return result;
        };
        ArrayUtilities.last = function (array) {
            if (array.length === 0) {
                throw TypeScript.Errors.argumentOutOfRange('array');
            }
            return array[array.length - 1];
        };
        ArrayUtilities.lastOrDefault = function (array, predicate) {
            for (var i = array.length - 1; i >= 0; i--) {
                var v = array[i];
                if (predicate(v, i)) {
                    return v;
                }
            }
            return null;
        };
        ArrayUtilities.firstOrDefault = function (array, func) {
            for (var i = 0, n = array.length; i < n; i++) {
                var value = array[i];
                if (func(value, i)) {
                    return value;
                }
            }
            return null;
        };
        ArrayUtilities.first = function (array, func) {
            for (var i = 0, n = array.length; i < n; i++) {
                var value = array[i];
                if (!func || func(value, i)) {
                    return value;
                }
            }
            throw TypeScript.Errors.invalidOperation();
        };
        ArrayUtilities.sum = function (array, func) {
            var result = 0;
            for (var i = 0, n = array.length; i < n; i++) {
                result += func(array[i]);
            }
            return result;
        };
        ArrayUtilities.select = function (values, func) {
            var result = new Array(values.length);
            for (var i = 0; i < values.length; i++) {
                result[i] = func(values[i]);
            }
            return result;
        };
        ArrayUtilities.where = function (values, func) {
            var result = new Array();
            for (var i = 0; i < values.length; i++) {
                if (func(values[i])) {
                    result.push(values[i]);
                }
            }
            return result;
        };
        ArrayUtilities.any = function (array, func) {
            for (var i = 0, n = array.length; i < n; i++) {
                if (func(array[i])) {
                    return true;
                }
            }
            return false;
        };
        ArrayUtilities.all = function (array, func) {
            for (var i = 0, n = array.length; i < n; i++) {
                if (!func(array[i])) {
                    return false;
                }
            }
            return true;
        };
        ArrayUtilities.binarySearch = function (array, value) {
            var low = 0;
            var high = array.length - 1;
            while (low <= high) {
                var middle = low + ((high - low) >> 1);
                var midValue = array[middle];
                if (midValue === value) {
                    return middle;
                }
                else if (midValue > value) {
                    high = middle - 1;
                }
                else {
                    low = middle + 1;
                }
            }
            return ~low;
        };
        ArrayUtilities.createArray = function (length, defaultValue) {
            var result = new Array(length);
            for (var i = 0; i < length; i++) {
                result[i] = defaultValue;
            }
            return result;
        };
        ArrayUtilities.grow = function (array, length, defaultValue) {
            var count = length - array.length;
            for (var i = 0; i < count; i++) {
                array.push(defaultValue);
            }
        };
        ArrayUtilities.copy = function (sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
            for (var i = 0; i < length; i++) {
                destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
            }
        };
        ArrayUtilities.indexOf = function (array, predicate) {
            for (var i = 0, n = array.length; i < n; i++) {
                if (predicate(array[i])) {
                    return i;
                }
            }
            return -1;
        };
        return ArrayUtilities;
    })();
    TypeScript.ArrayUtilities = ArrayUtilities;
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    (function (BitVector) {
        var pool = [];
        var Constants;
        (function (Constants) {
            Constants[Constants["MaxBitsPerEncodedNumber"] = 30] = "MaxBitsPerEncodedNumber";
            Constants[Constants["BitsPerEncodedBiStateValue"] = 1] = "BitsPerEncodedBiStateValue";
            Constants[Constants["BitsPerEncodedTriStateValue"] = 2] = "BitsPerEncodedTriStateValue";
            Constants[Constants["BiStateEncodedTrue"] = 1] = "BiStateEncodedTrue";
            Constants[Constants["BiStateClearBitsMask"] = 1] = "BiStateClearBitsMask";
            Constants[Constants["TriStateEncodedFalse"] = 1] = "TriStateEncodedFalse";
            Constants[Constants["TriStateEncodedTrue"] = 2] = "TriStateEncodedTrue";
            Constants[Constants["TriStateClearBitsMask"] = 3] = "TriStateClearBitsMask";
        })(Constants || (Constants = {}));
        var BitVectorImpl = (function () {
            function BitVectorImpl(allowUndefinedValues) {
                this.allowUndefinedValues = allowUndefinedValues;
                this.isReleased = false;
                this.bits = [];
            }
            BitVectorImpl.prototype.computeTriStateArrayIndex = function (index) {
                var encodedValuesPerNumber = 30 /* MaxBitsPerEncodedNumber */ / 2 /* BitsPerEncodedTriStateValue */;
                return (index / encodedValuesPerNumber) >>> 0;
            };
            BitVectorImpl.prototype.computeBiStateArrayIndex = function (index) {
                var encodedValuesPerNumber = 30 /* MaxBitsPerEncodedNumber */ / 1 /* BitsPerEncodedBiStateValue */;
                return (index / encodedValuesPerNumber) >>> 0;
            };
            BitVectorImpl.prototype.computeTriStateEncodedValueIndex = function (index) {
                var encodedValuesPerNumber = 30 /* MaxBitsPerEncodedNumber */ / 2 /* BitsPerEncodedTriStateValue */;
                return (index % encodedValuesPerNumber) * 2 /* BitsPerEncodedTriStateValue */;
            };
            BitVectorImpl.prototype.computeBiStateEncodedValueIndex = function (index) {
                var encodedValuesPerNumber = 30 /* MaxBitsPerEncodedNumber */ / 1 /* BitsPerEncodedBiStateValue */;
                return (index % encodedValuesPerNumber) * 1 /* BitsPerEncodedBiStateValue */;
            };
            BitVectorImpl.prototype.valueAt = function (index) {
                TypeScript.Debug.assert(!this.isReleased, "Should not use a released bitvector");
                if (this.allowUndefinedValues) {
                    var arrayIndex = this.computeTriStateArrayIndex(index);
                    var encoded = this.bits[arrayIndex];
                    if (encoded === undefined) {
                        return undefined;
                    }
                    var bitIndex = this.computeTriStateEncodedValueIndex(index);
                    if (encoded & (2 /* TriStateEncodedTrue */ << bitIndex)) {
                        return true;
                    }
                    else if (encoded & (1 /* TriStateEncodedFalse */ << bitIndex)) {
                        return false;
                    }
                    else {
                        return undefined;
                    }
                }
                else {
                    var arrayIndex = this.computeBiStateArrayIndex(index);
                    var encoded = this.bits[arrayIndex];
                    if (encoded === undefined) {
                        return false;
                    }
                    var bitIndex = this.computeBiStateEncodedValueIndex(index);
                    if (encoded & (1 /* BiStateEncodedTrue */ << bitIndex)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            };
            BitVectorImpl.prototype.setValueAt = function (index, value) {
                TypeScript.Debug.assert(!this.isReleased, "Should not use a released bitvector");
                if (this.allowUndefinedValues) {
                    TypeScript.Debug.assert(value === true || value === false || value === undefined, "value must only be true, false or undefined.");
                    var arrayIndex = this.computeTriStateArrayIndex(index);
                    var encoded = this.bits[arrayIndex];
                    if (encoded === undefined) {
                        if (value === undefined) {
                            return;
                        }
                        encoded = 0;
                    }
                    var bitIndex = this.computeTriStateEncodedValueIndex(index);
                    var clearMask = ~(3 /* TriStateClearBitsMask */ << bitIndex);
                    encoded = encoded & clearMask;
                    if (value === true) {
                        encoded = encoded | (2 /* TriStateEncodedTrue */ << bitIndex);
                    }
                    else if (value === false) {
                        encoded = encoded | (1 /* TriStateEncodedFalse */ << bitIndex);
                    }
                    this.bits[arrayIndex] = encoded;
                }
                else {
                    TypeScript.Debug.assert(value === true || value === false, "value must only be true or false.");
                    var arrayIndex = this.computeBiStateArrayIndex(index);
                    var encoded = this.bits[arrayIndex];
                    if (encoded === undefined) {
                        if (value === false) {
                            return;
                        }
                        encoded = 0;
                    }
                    var bitIndex = this.computeBiStateEncodedValueIndex(index);
                    encoded = encoded & ~(1 /* BiStateClearBitsMask */ << bitIndex);
                    if (value) {
                        encoded = encoded | (1 /* BiStateEncodedTrue */ << bitIndex);
                    }
                    this.bits[arrayIndex] = encoded;
                }
            };
            BitVectorImpl.prototype.release = function () {
                TypeScript.Debug.assert(!this.isReleased, "Should not use a released bitvector");
                this.isReleased = true;
                this.bits.length = 0;
                pool.push(this);
            };
            return BitVectorImpl;
        })();
        function getBitVector(allowUndefinedValues) {
            if (pool.length === 0) {
                return new BitVectorImpl(allowUndefinedValues);
            }
            var vector = pool.pop();
            vector.isReleased = false;
            vector.allowUndefinedValues = allowUndefinedValues;
            return vector;
        }
        BitVector.getBitVector = getBitVector;
    })(TypeScript.BitVector || (TypeScript.BitVector = {}));
    var BitVector = TypeScript.BitVector;
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    (function (BitMatrix) {
        var pool = [];
        var BitMatrixImpl = (function () {
            function BitMatrixImpl(allowUndefinedValues) {
                this.allowUndefinedValues = allowUndefinedValues;
                this.isReleased = false;
                this.vectors = [];
            }
            BitMatrixImpl.prototype.valueAt = function (x, y) {
                TypeScript.Debug.assert(!this.isReleased, "Should not use a released bitvector");
                var vector = this.vectors[x];
                if (!vector) {
                    return this.allowUndefinedValues ? undefined : false;
                }
                return vector.valueAt(y);
            };
            BitMatrixImpl.prototype.setValueAt = function (x, y, value) {
                TypeScript.Debug.assert(!this.isReleased, "Should not use a released bitvector");
                var vector = this.vectors[x];
                if (!vector) {
                    if (value === undefined) {
                        return;
                    }
                    vector = TypeScript.BitVector.getBitVector(this.allowUndefinedValues);
                    this.vectors[x] = vector;
                }
                vector.setValueAt(y, value);
            };
            BitMatrixImpl.prototype.release = function () {
                TypeScript.Debug.assert(!this.isReleased, "Should not use a released bitvector");
                this.isReleased = true;
                for (var name in this.vectors) {
                    if (this.vectors.hasOwnProperty(name)) {
                        var vector = this.vectors[name];
                        vector.release();
                    }
                }
                this.vectors.length = 0;
                pool.push(this);
            };
            return BitMatrixImpl;
        })();
        function getBitMatrix(allowUndefinedValues) {
            if (pool.length === 0) {
                return new BitMatrixImpl(allowUndefinedValues);
            }
            var matrix = pool.pop();
            matrix.isReleased = false;
            matrix.allowUndefinedValues = allowUndefinedValues;
            return matrix;
        }
        BitMatrix.getBitMatrix = getBitMatrix;
    })(TypeScript.BitMatrix || (TypeScript.BitMatrix = {}));
    var BitMatrix = TypeScript.BitMatrix;
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    (function (Constants) {
        Constants[Constants["Max31BitInteger"] = 1073741823] = "Max31BitInteger";
        Constants[Constants["Min31BitInteger"] = -1073741824] = "Min31BitInteger";
    })(TypeScript.Constants || (TypeScript.Constants = {}));
    var Constants = TypeScript.Constants;
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    (function (AssertionLevel) {
        AssertionLevel[AssertionLevel["Normal"] = 1] = "Normal";
        AssertionLevel[AssertionLevel["Aggressive"] = 2] = "Aggressive";
        AssertionLevel[AssertionLevel["VeryAggressive"] = 3] = "VeryAggressive";
    })(TypeScript.AssertionLevel || (TypeScript.AssertionLevel = {}));
    var AssertionLevel = TypeScript.AssertionLevel;
    var Debug = (function () {
        function Debug() {
        }
        Debug.shouldAssert = function (level) {
            return this.currentAssertionLevel >= level;
        };
        Debug.assert = function (expression, message, verboseDebugInfo) {
            if (!expression) {
                var verboseDebugString = "";
                if (verboseDebugInfo) {
                    verboseDebugString = "\r\nVerbose Debug Information:" + verboseDebugInfo();
                }
                throw new Error("Debug Failure. False expression: " + (message || "") + verboseDebugString);
            }
        };
        Debug.fail = function (message) {
            Debug.assert(false, message);
        };
        Debug.currentAssertionLevel = 1 /* Normal */;
        return Debug;
    })();
    TypeScript.Debug = Debug;
})(TypeScript || (TypeScript = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeScript;
(function (TypeScript) {
    TypeScript.LocalizedDiagnosticMessages = null;
    var Location = (function () {
        function Location(fileName, lineMap, start, length) {
            this._fileName = fileName;
            this._lineMap = lineMap;
            this._start = start;
            this._length = length;
        }
        Location.prototype.fileName = function () {
            return this._fileName;
        };
        Location.prototype.lineMap = function () {
            return this._lineMap;
        };
        Location.prototype.line = function () {
            return this._lineMap ? this._lineMap.getLineNumberFromPosition(this.start()) : 0;
        };
        Location.prototype.character = function () {
            return this._lineMap ? this._lineMap.getLineAndCharacterFromPosition(this.start()).character() : 0;
        };
        Location.prototype.start = function () {
            return this._start;
        };
        Location.prototype.length = function () {
            return this._length;
        };
        Location.equals = function (location1, location2) {
            return location1._fileName === location2._fileName && location1._start === location2._start && location1._length === location2._length;
        };
        return Location;
    })();
    TypeScript.Location = Location;
    var Diagnostic = (function (_super) {
        __extends(Diagnostic, _super);
        function Diagnostic(fileName, lineMap, start, length, diagnosticKey, _arguments, additionalLocations) {
            if (_arguments === void 0) { _arguments = null; }
            if (additionalLocations === void 0) { additionalLocations = null; }
            _super.call(this, fileName, lineMap, start, length);
            this._diagnosticKey = diagnosticKey;
            this._arguments = (_arguments && _arguments.length > 0) ? _arguments : null;
            this._additionalLocations = (additionalLocations && additionalLocations.length > 0) ? additionalLocations : null;
        }
        Diagnostic.prototype.toJSON = function (key) {
            var result = {};
            result.start = this.start();
            result.length = this.length();
            result.diagnosticCode = this._diagnosticKey;
            var _arguments = this.arguments();
            if (_arguments && _arguments.length > 0) {
                result.arguments = _arguments;
            }
            return result;
        };
        Diagnostic.prototype.diagnosticKey = function () {
            return this._diagnosticKey;
        };
        Diagnostic.prototype.arguments = function () {
            return this._arguments;
        };
        Diagnostic.prototype.text = function () {
            return TypeScript.getLocalizedText(this._diagnosticKey, this._arguments);
        };
        Diagnostic.prototype.message = function () {
            return TypeScript.getDiagnosticMessage(this._diagnosticKey, this._arguments);
        };
        Diagnostic.prototype.additionalLocations = function () {
            return this._additionalLocations || [];
        };
        Diagnostic.equals = function (diagnostic1, diagnostic2) {
            return Location.equals(diagnostic1, diagnostic2) && diagnostic1._diagnosticKey === diagnostic2._diagnosticKey && TypeScript.ArrayUtilities.sequenceEquals(diagnostic1._arguments, diagnostic2._arguments, function (v1, v2) { return v1 === v2; });
        };
        Diagnostic.prototype.info = function () {
            return getDiagnosticInfoFromKey(this.diagnosticKey());
        };
        return Diagnostic;
    })(Location);
    TypeScript.Diagnostic = Diagnostic;
    function newLine() {
        return TypeScript.Environment ? TypeScript.Environment.newLine : "\r\n";
    }
    TypeScript.newLine = newLine;
    function getLargestIndex(diagnostic) {
        var largest = -1;
        var regex = /\{(\d+)\}/g;
        var match;
        while (match = regex.exec(diagnostic)) {
            var val = parseInt(match[1]);
            if (!isNaN(val) && val > largest) {
                largest = val;
            }
        }
        return largest;
    }
    function getDiagnosticInfoFromKey(diagnosticKey) {
        var result = TypeScript.diagnosticInformationMap[diagnosticKey];
        TypeScript.Debug.assert(result);
        return result;
    }
    function getLocalizedText(diagnosticKey, args) {
        if (TypeScript.LocalizedDiagnosticMessages) {
        }
        var diagnosticMessageText = TypeScript.LocalizedDiagnosticMessages ? TypeScript.LocalizedDiagnosticMessages[diagnosticKey] : diagnosticKey;
        diagnosticMessageText = diagnosticMessageText || diagnosticKey;
        TypeScript.Debug.assert(diagnosticMessageText !== undefined && diagnosticMessageText !== null);
        var actualCount = args ? args.length : 0;
        var expectedCount = 1 + getLargestIndex(diagnosticKey);
        if (expectedCount !== actualCount) {
            throw new Error(getLocalizedText(TypeScript.DiagnosticCode.Expected_0_arguments_to_message_got_1_instead, [expectedCount, actualCount]));
        }
        var valueCount = 1 + getLargestIndex(diagnosticMessageText);
        if (valueCount !== expectedCount) {
            throw new Error(getLocalizedText(TypeScript.DiagnosticCode.Expected_the_message_0_to_have_1_arguments_but_it_had_2, [diagnosticMessageText, expectedCount, valueCount]));
        }
        diagnosticMessageText = diagnosticMessageText.replace(/{(\d+)}/g, function (match, num) {
            return typeof args[num] !== 'undefined' ? args[num] : match;
        });
        diagnosticMessageText = diagnosticMessageText.replace(/{(NL)}/g, function (match) {
            return TypeScript.newLine();
        });
        return diagnosticMessageText;
    }
    TypeScript.getLocalizedText = getLocalizedText;
    function getDiagnosticMessage(diagnosticKey, args) {
        var diagnostic = getDiagnosticInfoFromKey(diagnosticKey);
        var diagnosticMessageText = getLocalizedText(diagnosticKey, args);
        var message;
        if (diagnostic.category === 1 /* Error */) {
            message = getLocalizedText(TypeScript.DiagnosticCode.error_TS_0_1, [diagnostic.code, diagnosticMessageText]);
        }
        else if (diagnostic.category === 0 /* Warning */) {
            message = getLocalizedText(TypeScript.DiagnosticCode.warning_TS_0_1, [diagnostic.code, diagnosticMessageText]);
        }
        else {
            message = diagnosticMessageText;
        }
        return message;
    }
    TypeScript.getDiagnosticMessage = getDiagnosticMessage;
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    var Errors = (function () {
        function Errors() {
        }
        Errors.argument = function (argument, message) {
            return new Error("Invalid argument: " + argument + ". " + message);
        };
        Errors.argumentOutOfRange = function (argument) {
            return new Error("Argument out of range: " + argument);
        };
        Errors.argumentNull = function (argument) {
            return new Error("Argument null: " + argument);
        };
        Errors.abstract = function () {
            return new Error("Operation not implemented properly by subclass.");
        };
        Errors.notYetImplemented = function () {
            return new Error("Not yet implemented.");
        };
        Errors.invalidOperation = function (message) {
            return new Error("Invalid operation: " + message);
        };
        return Errors;
    })();
    TypeScript.Errors = Errors;
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    var Hash = (function () {
        function Hash() {
        }
        Hash.computeFnv1aCharArrayHashCode = function (text, start, len) {
            var hashCode = Hash.FNV_BASE;
            var end = start + len;
            for (var i = start; i < end; i++) {
                hashCode = TypeScript.IntegerUtilities.integerMultiplyLow32Bits(hashCode ^ text[i], Hash.FNV_PRIME);
            }
            return hashCode;
        };
        Hash.computeSimple31BitCharArrayHashCode = function (key, start, len) {
            var hash = 0;
            for (var i = 0; i < len; i++) {
                var ch = key[start + i];
                hash = ((((hash << 5) - hash) | 0) + ch) | 0;
            }
            return hash & 0x7FFFFFFF;
        };
        Hash.computeSimple31BitStringHashCode = function (key) {
            var hash = 0;
            var start = 0;
            var len = key.length;
            for (var i = 0; i < len; i++) {
                var ch = key.charCodeAt(start + i);
                hash = ((((hash << 5) - hash) | 0) + ch) | 0;
            }
            return hash & 0x7FFFFFFF;
        };
        Hash.computeMurmur2StringHashCode = function (key, seed) {
            var m = 0x5bd1e995;
            var r = 24;
            var numberOfCharsLeft = key.length;
            var h = Math.abs(seed ^ numberOfCharsLeft);
            var index = 0;
            while (numberOfCharsLeft >= 2) {
                var c1 = key.charCodeAt(index);
                var c2 = key.charCodeAt(index + 1);
                var k = Math.abs(c1 | (c2 << 16));
                k = TypeScript.IntegerUtilities.integerMultiplyLow32Bits(k, m);
                k ^= k >> r;
                k = TypeScript.IntegerUtilities.integerMultiplyLow32Bits(k, m);
                h = TypeScript.IntegerUtilities.integerMultiplyLow32Bits(h, m);
                h ^= k;
                index += 2;
                numberOfCharsLeft -= 2;
            }
            if (numberOfCharsLeft === 1) {
                h ^= key.charCodeAt(index);
                h = TypeScript.IntegerUtilities.integerMultiplyLow32Bits(h, m);
            }
            h ^= h >> 13;
            h = TypeScript.IntegerUtilities.integerMultiplyLow32Bits(h, m);
            h ^= h >> 15;
            return h;
        };
        Hash.combine = function (value, currentHash) {
            return (((currentHash << 5) + currentHash) + value) & 0x7FFFFFFF;
        };
        Hash.FNV_BASE = 2166136261;
        Hash.FNV_PRIME = 16777619;
        return Hash;
    })();
    TypeScript.Hash = Hash;
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    (function (IntegerUtilities) {
        function integerDivide(numerator, denominator) {
            return (numerator / denominator) >> 0;
        }
        IntegerUtilities.integerDivide = integerDivide;
        function integerMultiplyLow32Bits(n1, n2) {
            var n1Low16 = n1 & 0x0000ffff;
            var n1High16 = n1 >>> 16;
            var n2Low16 = n2 & 0x0000ffff;
            var n2High16 = n2 >>> 16;
            var resultLow32 = (((n1 & 0xffff0000) * n2) >>> 0) + (((n1 & 0x0000ffff) * n2) >>> 0) >>> 0;
            return resultLow32;
        }
        IntegerUtilities.integerMultiplyLow32Bits = integerMultiplyLow32Bits;
        function isInteger(text) {
            return /^[0-9]+$/.test(text);
        }
        IntegerUtilities.isInteger = isInteger;
        function isHexInteger(text) {
            return /^0(x|X)[0-9a-fA-F]+$/.test(text);
        }
        IntegerUtilities.isHexInteger = isHexInteger;
    })(TypeScript.IntegerUtilities || (TypeScript.IntegerUtilities = {}));
    var IntegerUtilities = TypeScript.IntegerUtilities;
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    var LineMap = (function () {
        function LineMap(_computeLineStarts, length) {
            this._computeLineStarts = _computeLineStarts;
            this.length = length;
            this._lineStarts = null;
        }
        LineMap.prototype.toJSON = function (key) {
            return { lineStarts: this.lineStarts(), length: this.length };
        };
        LineMap.prototype.equals = function (other) {
            return this.length === other.length && TypeScript.ArrayUtilities.sequenceEquals(this.lineStarts(), other.lineStarts(), function (v1, v2) { return v1 === v2; });
        };
        LineMap.prototype.lineStarts = function () {
            if (this._lineStarts === null) {
                this._lineStarts = this._computeLineStarts();
            }
            return this._lineStarts;
        };
        LineMap.prototype.lineCount = function () {
            return this.lineStarts().length;
        };
        LineMap.prototype.getPosition = function (line, character) {
            return this.lineStarts()[line] + character;
        };
        LineMap.prototype.getLineNumberFromPosition = function (position) {
            if (position < 0 || position > this.length) {
                throw TypeScript.Errors.argumentOutOfRange("position");
            }
            if (position === this.length) {
                return this.lineCount() - 1;
            }
            var lineNumber = TypeScript.ArrayUtilities.binarySearch(this.lineStarts(), position);
            if (lineNumber < 0) {
                lineNumber = (~lineNumber) - 1;
            }
            return lineNumber;
        };
        LineMap.prototype.getLineStartPosition = function (lineNumber) {
            return this.lineStarts()[lineNumber];
        };
        LineMap.prototype.fillLineAndCharacterFromPosition = function (position, lineAndCharacter) {
            if (position < 0 || position > this.length) {
                throw TypeScript.Errors.argumentOutOfRange("position");
            }
            var lineNumber = this.getLineNumberFromPosition(position);
            lineAndCharacter.line = lineNumber;
            lineAndCharacter.character = position - this.lineStarts()[lineNumber];
        };
        LineMap.prototype.getLineAndCharacterFromPosition = function (position) {
            if (position < 0 || position > this.length) {
                throw TypeScript.Errors.argumentOutOfRange("position");
            }
            var lineNumber = this.getLineNumberFromPosition(position);
            return new TypeScript.LineAndCharacter(lineNumber, position - this.lineStarts()[lineNumber]);
        };
        LineMap.empty = new LineMap(function () { return [0]; }, 0);
        return LineMap;
    })();
    TypeScript.LineMap = LineMap;
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    var LineAndCharacter = (function () {
        function LineAndCharacter(line, character) {
            this._line = 0;
            this._character = 0;
            if (line < 0) {
                throw TypeScript.Errors.argumentOutOfRange("line");
            }
            if (character < 0) {
                throw TypeScript.Errors.argumentOutOfRange("character");
            }
            this._line = line;
            this._character = character;
        }
        LineAndCharacter.prototype.line = function () {
            return this._line;
        };
        LineAndCharacter.prototype.character = function () {
            return this._character;
        };
        return LineAndCharacter;
    })();
    TypeScript.LineAndCharacter = LineAndCharacter;
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    var StringUtilities = (function () {
        function StringUtilities() {
        }
        StringUtilities.isString = function (value) {
            return Object.prototype.toString.apply(value, []) === '[object String]';
        };
        StringUtilities.endsWith = function (string, value) {
            return string.substring(string.length - value.length, string.length) === value;
        };
        StringUtilities.startsWith = function (string, value) {
            return string.substr(0, value.length) === value;
        };
        StringUtilities.repeat = function (value, count) {
            return Array(count + 1).join(value);
        };
        return StringUtilities;
    })();
    TypeScript.StringUtilities = StringUtilities;
})(TypeScript || (TypeScript = {}));
var global = Function("return this").call(null);
var TypeScript;
(function (TypeScript) {
    var Clock;
    (function (Clock) {
        Clock.now;
        Clock.resolution;
        if (typeof WScript !== "undefined" && typeof global['WScript'].InitializeProjection !== "undefined") {
            global['WScript'].InitializeProjection();
            Clock.now = function () {
                return TestUtilities.QueryPerformanceCounter();
            };
            Clock.resolution = TestUtilities.QueryPerformanceFrequency();
        }
        else {
            Clock.now = function () {
                return Date.now();
            };
            Clock.resolution = 1000;
        }
    })(Clock || (Clock = {}));
    var Timer = (function () {
        function Timer() {
            this.time = 0;
        }
        Timer.prototype.start = function () {
            this.time = 0;
            this.startTime = Clock.now();
        };
        Timer.prototype.end = function () {
            this.time = (Clock.now() - this.startTime);
        };
        return Timer;
    })();
    TypeScript.Timer = Timer;
})(TypeScript || (TypeScript = {}));
var TypeScript;
(function (TypeScript) {
    TypeScript.nodeMakeDirectoryTime = 0;
    TypeScript.nodeCreateBufferTime = 0;
    TypeScript.nodeWriteFileSyncTime = 0;
    (function (ByteOrderMark) {
        ByteOrderMark[ByteOrderMark["None"] = 0] = "None";
        ByteOrderMark[ByteOrderMark["Utf8"] = 1] = "Utf8";
        ByteOrderMark[ByteOrderMark["Utf16BigEndian"] = 2] = "Utf16BigEndian";
        ByteOrderMark[ByteOrderMark["Utf16LittleEndian"] = 3] = "Utf16LittleEndian";
    })(TypeScript.ByteOrderMark || (TypeScript.ByteOrderMark = {}));
    var ByteOrderMark = TypeScript.ByteOrderMark;
    var FileInformation = (function () {
        function FileInformation(contents, byteOrderMark) {
            this.contents = contents;
            this.byteOrderMark = byteOrderMark;
        }
        return FileInformation;
    })();
    TypeScript.FileInformation = FileInformation;
    function throwIOError(message, error) {
        var errorMessage = message;
        if (error && error.message) {
            errorMessage += (" " + error.message);
        }
        throw new Error(errorMessage);
    }
    TypeScript.Environment = (function () {
        function getWindowsScriptHostEnvironment() {
            try {
                var fso = new ActiveXObject("Scripting.FileSystemObject");
            }
            catch (e) {
                return null;
            }
            var streamObjectPool = [];
            function getStreamObject() {
                if (streamObjectPool.length > 0) {
                    return streamObjectPool.pop();
                }
                else {
                    return new ActiveXObject("ADODB.Stream");
                }
            }
            function releaseStreamObject(obj) {
                streamObjectPool.push(obj);
            }
            var args = [];
            for (var i = 0; i < WScript.Arguments.length; i++) {
                args[i] = WScript.Arguments.Item(i);
            }
            return {
                newLine: "\r\n",
                currentDirectory: function () { return WScript.CreateObject("WScript.Shell").CurrentDirectory; },
                supportsCodePage: function () { return WScript.ReadFile; },
                absolutePath: function (path) { return fso.GetAbsolutePathName(path); },
                readFile: function (path, codepage) {
                    try {
                        if (codepage !== null && this.supportsCodePage()) {
                            try {
                                var contents = WScript.ReadFile(path, codepage);
                                return new FileInformation(contents, 0 /* None */);
                            }
                            catch (e) {
                            }
                        }
                        var streamObj = getStreamObject();
                        streamObj.Open();
                        streamObj.Type = 2;
                        streamObj.Charset = 'x-ansi';
                        streamObj.LoadFromFile(path);
                        var bomChar = streamObj.ReadText(2);
                        streamObj.Position = 0;
                        var byteOrderMark = 0 /* None */;
                        if (bomChar.charCodeAt(0) === 0xFE && bomChar.charCodeAt(1) === 0xFF) {
                            streamObj.Charset = 'unicode';
                            byteOrderMark = 2 /* Utf16BigEndian */;
                        }
                        else if (bomChar.charCodeAt(0) === 0xFF && bomChar.charCodeAt(1) === 0xFE) {
                            streamObj.Charset = 'unicode';
                            byteOrderMark = 3 /* Utf16LittleEndian */;
                        }
                        else if (bomChar.charCodeAt(0) === 0xEF && bomChar.charCodeAt(1) === 0xBB) {
                            streamObj.Charset = 'utf-8';
                            byteOrderMark = 1 /* Utf8 */;
                        }
                        else {
                            streamObj.Charset = 'utf-8';
                        }
                        var contents = streamObj.ReadText(-1);
                        streamObj.Close();
                        releaseStreamObject(streamObj);
                        return new FileInformation(contents, byteOrderMark);
                    }
                    catch (err) {
                        var message;
                        if (err.number === -2147024809) {
                            message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Unsupported_file_encoding, null);
                        }
                        else {
                            message = TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Cannot_read_file_0_1, [path, err.message]);
                        }
                        throw new Error(message);
                    }
                },
                writeFile: function (path, contents, writeByteOrderMark) {
                    var textStream = getStreamObject();
                    textStream.Charset = 'utf-8';
                    textStream.Open();
                    textStream.WriteText(contents, 0);
                    if (!writeByteOrderMark) {
                        textStream.Position = 3;
                    }
                    else {
                        textStream.Position = 0;
                    }
                    var fileStream = getStreamObject();
                    fileStream.Type = 1;
                    fileStream.Open();
                    textStream.CopyTo(fileStream);
                    fileStream.Flush();
                    fileStream.SaveToFile(path, 2);
                    fileStream.Close();
                    textStream.Flush();
                    textStream.Close();
                },
                fileExists: function (path) { return fso.FileExists(path); },
                deleteFile: function (path) {
                    if (fso.FileExists(path)) {
                        fso.DeleteFile(path, true);
                    }
                },
                directoryExists: function (path) { return fso.FolderExists(path); },
                directoryName: function (path) { return fso.GetParentFolderName(path); },
                createDirectory: function (path) {
                    try {
                        if (!this.directoryExists(path)) {
                            fso.CreateFolder(path);
                        }
                    }
                    catch (e) {
                        throwIOError(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Could_not_create_directory_0, [path]), e);
                    }
                },
                listFiles: function (path, spec, options) {
                    options = options || {};
                    function filesInFolder(folder, root) {
                        var paths = [];
                        var fc;
                        if (options.recursive) {
                            fc = new Enumerator(folder.subfolders);
                            for (; !fc.atEnd(); fc.moveNext()) {
                                paths = paths.concat(filesInFolder(fc.item(), root + "\\" + fc.item().Name));
                            }
                        }
                        fc = new Enumerator(folder.files);
                        for (; !fc.atEnd(); fc.moveNext()) {
                            if (!spec || fc.item().Name.match(spec)) {
                                paths.push(root + "\\" + fc.item().Name);
                            }
                        }
                        return paths;
                    }
                    var folder = fso.GetFolder(path);
                    var paths = [];
                    return filesInFolder(folder, path);
                },
                arguments: args,
                standardOut: WScript.StdOut,
                standardError: WScript.StdErr,
                executingFilePath: function () { return WScript.ScriptFullName; },
                quit: function (exitCode) {
                    if (exitCode === void 0) { exitCode = 0; }
                    try {
                        WScript.Quit(exitCode);
                    }
                    catch (e) {
                    }
                },
                watchFile: null
            };
        }
        ;
        function getNodeEnvironment() {
            var _fs = require('fs');
            var _path = require('path');
            var _module = require('module');
            var _os = require('os');
            return {
                newLine: _os.EOL,
                currentDirectory: function () { return process.cwd(); },
                supportsCodePage: function () { return false; },
                absolutePath: function (path) { return _path.resolve(path); },
                readFile: function (file, codepage) {
                    if (codepage !== null) {
                        throw new Error(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.codepage_option_not_supported_on_current_platform, null));
                    }
                    var buffer = _fs.readFileSync(file);
                    switch (buffer[0]) {
                        case 0xFE:
                            if (buffer[1] === 0xFF) {
                                var i = 0;
                                while ((i + 1) < buffer.length) {
                                    var temp = buffer[i];
                                    buffer[i] = buffer[i + 1];
                                    buffer[i + 1] = temp;
                                    i += 2;
                                }
                                return new FileInformation(buffer.toString("ucs2", 2), 2 /* Utf16BigEndian */);
                            }
                            break;
                        case 0xFF:
                            if (buffer[1] === 0xFE) {
                                return new FileInformation(buffer.toString("ucs2", 2), 3 /* Utf16LittleEndian */);
                            }
                            break;
                        case 0xEF:
                            if (buffer[1] === 0xBB) {
                                return new FileInformation(buffer.toString("utf8", 3), 1 /* Utf8 */);
                            }
                    }
                    return new FileInformation(buffer.toString("utf8", 0), 0 /* None */);
                },
                writeFile: function (path, contents, writeByteOrderMark) {
                    function mkdirRecursiveSync(path) {
                        var stats = _fs.statSync(path);
                        if (stats.isFile()) {
                            throw "\"" + path + "\" exists but isn't a directory.";
                        }
                        else if (stats.isDirectory()) {
                            return;
                        }
                        else {
                            mkdirRecursiveSync(_path.dirname(path));
                            _fs.mkdirSync(path, 509);
                        }
                    }
                    var start = new Date().getTime();
                    mkdirRecursiveSync(_path.dirname(path));
                    TypeScript.nodeMakeDirectoryTime += new Date().getTime() - start;
                    if (writeByteOrderMark) {
                        contents = '\uFEFF' + contents;
                    }
                    var start = new Date().getTime();
                    var chunkLength = 4 * 1024;
                    var fileDescriptor = _fs.openSync(path, "w");
                    try {
                        for (var index = 0; index < contents.length; index += chunkLength) {
                            var bufferStart = new Date().getTime();
                            var buffer = new Buffer(contents.substr(index, chunkLength), "utf8");
                            TypeScript.nodeCreateBufferTime += new Date().getTime() - bufferStart;
                            _fs.writeSync(fileDescriptor, buffer, 0, buffer.length, null);
                        }
                    }
                    finally {
                        _fs.closeSync(fileDescriptor);
                    }
                    TypeScript.nodeWriteFileSyncTime += new Date().getTime() - start;
                },
                fileExists: function (path) { return _fs.existsSync(path); },
                deleteFile: function (path) {
                    try {
                        _fs.unlinkSync(path);
                    }
                    catch (e) {
                    }
                },
                directoryExists: function (path) { return _fs.existsSync(path) && _fs.statSync(path).isDirectory(); },
                directoryName: function (path) {
                    var dirPath = _path.dirname(path);
                    if (dirPath === path) {
                        dirPath = null;
                    }
                    return dirPath;
                },
                createDirectory: function (path) {
                    try {
                        if (!this.directoryExists(path)) {
                            _fs.mkdirSync(path);
                        }
                    }
                    catch (e) {
                        throwIOError(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Could_not_create_directory_0, [path]), e);
                    }
                },
                listFiles: function (path, spec, options) {
                    options = options || {};
                    function filesInFolder(folder) {
                        var paths = [];
                        var files = _fs.readdirSync(folder);
                        for (var i = 0; i < files.length; i++) {
                            var pathToFile = _path.join(folder, files[i]);
                            var stat = _fs.statSync(pathToFile);
                            if (options.recursive && stat.isDirectory()) {
                                paths = paths.concat(filesInFolder(pathToFile));
                            }
                            else if (stat.isFile() && (!spec || files[i].match(spec))) {
                                paths.push(pathToFile);
                            }
                        }
                        return paths;
                    }
                    return filesInFolder(path);
                },
                arguments: process.argv.slice(2),
                standardOut: {
                    Write: function (str) { return process.stdout.write(str); },
                    WriteLine: function (str) { return process.stdout.write(str + '\n'); },
                    Close: function Close() {
                    }
                },
                standardError: {
                    Write: function (str) { return process.stderr.write(str); },
                    WriteLine: function (str) { return process.stderr.write(str + '\n'); },
                    Close: function Close() {
                    }
                },
                executingFilePath: function () { return process.mainModule.filename; },
                quit: function (code) {
                    var stderrFlushed = process.stderr.write('');
                    var stdoutFlushed = process.stdout.write('');
                    process.stderr.on('drain', function () {
                        stderrFlushed = true;
                        if (stdoutFlushed) {
                            process.exit(code);
                        }
                    });
                    process.stdout.on('drain', function () {
                        stdoutFlushed = true;
                        if (stderrFlushed) {
                            process.exit(code);
                        }
                    });
                    setTimeout(function () {
                        process.exit(code);
                    }, 5);
                },
                watchFile: function (fileName, callback) {
                    var firstRun = true;
                    var processingChange = false;
                    var fileChanged = function (curr, prev) {
                        if (!firstRun) {
                            if (curr.mtime < prev.mtime) {
                                return;
                            }
                            _fs.unwatchFile(fileName, fileChanged);
                            if (!processingChange) {
                                processingChange = true;
                                callback(fileName);
                                setTimeout(function () {
                                    processingChange = false;
                                }, 100);
                            }
                        }
                        firstRun = false;
                        _fs.watchFile(fileName, { persistent: true, interval: 500 }, fileChanged);
                    };
                    fileChanged();
                    return {
                        fileName: fileName,
                        close: function () {
                            _fs.unwatchFile(fileName, fileChanged);
                        }
                    };
                }
            };
        }
        ;
        if (typeof WScript !== "undefined" && typeof ActiveXObject === "function") {
            return getWindowsScriptHostEnvironment();
        }
        else if (typeof module !== 'undefined' && module.exports) {
            return getNodeEnvironment();
        }
        else {
            return null;
        }
    })();
})(TypeScript || (TypeScript = {}));
function main() {
    var env = TypeScript.Environment;
    if (env.arguments.length < 1) {
        env.standardOut.WriteLine("Usage:");
        env.standardOut.WriteLine("\tnode processDiagnosticMessages.js <diagnostic-json-input-file>");
        return;
    }
    var inputFilePath = env.arguments[0];
    var inputStr = TypeScript.Environment.readFile(inputFilePath, null).contents;
    var diagnosticMesages = JSON.parse(inputStr);
    var names = Utilities.getObjectKeys(diagnosticMesages);
    var nameMap = buildUniqueNameMap(names);
    var infoFileOutput = buildInfoFileOutput(diagnosticMesages, nameMap);
    var fileOutputPath = env.directoryName(inputFilePath) + "/diagnosticInformationMap.generated.ts";
    env.writeFile(fileOutputPath, infoFileOutput, false);
}
function buildUniqueNameMap(names) {
    var nameMap = {};
    var uniqueNames = NameGenerator.ensureUniqueness(names, undefined, false);
    for (var i = 0; i < names.length; i++) {
        nameMap[names[i]] = uniqueNames[i];
    }
    return nameMap;
}
function buildInfoFileOutput(messageTable, nameMap) {
    var result = '// <auto-generated />\r\n' + '/// <reference path="types.ts" />\r\n' + 'module ts {\r\n' + '    export var Diagnostics = {\r\n';
    var names = Utilities.getObjectKeys(messageTable);
    for (var i = 0; i < names.length; i++) {
        var name = names[i];
        var diagnosticDetails = messageTable[name];
        result += '        ' + convertPropertyName(nameMap[name]) + ': { code: ' + diagnosticDetails.code + ', category: DiagnosticCategory.' + diagnosticDetails.category + ', key: "' + name.replace('"', '\\"') + '" },\r\n';
    }
    result += '    };\r\n}';
    return result;
}
function convertPropertyName(origName) {
    var result = origName.split("").map(function (char) {
        if (char === '*') {
            return "_Asterisk";
        }
        if (char === '/') {
            return "_Slash";
        }
        if (char === ':') {
            return "_Colon";
        }
        return /\w/.test(char) ? char : "_";
    }).join("");
    result = result.replace(/_+/g, "_");
    result = result.replace(/^_([^\d])/, "$1");
    result = result.replace(/_$/, "");
    return result;
}
var NameGenerator;
(function (NameGenerator) {
    function ensureUniqueness(names, isFixed, isCaseSensitive) {
        if (isFixed === void 0) { isFixed = names.map(function () { return false; }); }
        if (isCaseSensitive === void 0) { isCaseSensitive = true; }
        var names = names.map(function (x) { return x; });
        ensureUniquenessInPlace(names, isFixed, isCaseSensitive);
        return names;
    }
    NameGenerator.ensureUniqueness = ensureUniqueness;
    function ensureUniquenessInPlace(names, isFixed, isCaseSensitive) {
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            var collisionIndices = Utilities.collectMatchingIndices(name, names, isCaseSensitive);
            if (collisionIndices.length < 2) {
                continue;
            }
            handleCollisions(name, names, isFixed, collisionIndices, isCaseSensitive);
        }
    }
    function handleCollisions(name, proposedNames, isFixed, collisionIndices, isCaseSensitive) {
        var suffix = 1;
        for (var i = 0; i < collisionIndices.length; i++) {
            var collisionIndex = collisionIndices[i];
            if (isFixed[collisionIndex]) {
                continue;
            }
            while (true) {
                var newName = name + suffix++;
                if (proposedNames.some(function (name) { return Utilities.stringEquals(name, newName, isCaseSensitive); })) {
                    proposedNames[collisionIndex] = newName;
                    break;
                }
            }
        }
    }
})(NameGenerator || (NameGenerator = {}));
var Utilities;
(function (Utilities) {
    function collectMatchingIndices(name, proposedNames, isCaseSensitive) {
        if (isCaseSensitive === void 0) { isCaseSensitive = true; }
        var matchingIndices = [];
        for (var i = 0; i < proposedNames.length; i++) {
            if (stringEquals(name, proposedNames[i], isCaseSensitive)) {
                matchingIndices.push(i);
            }
        }
        return matchingIndices;
    }
    Utilities.collectMatchingIndices = collectMatchingIndices;
    function stringEquals(s1, s2, caseSensitive) {
        if (caseSensitive === void 0) { caseSensitive = true; }
        if (!caseSensitive) {
            s1 = s1.toLowerCase();
            s2 = s2.toLowerCase();
        }
        return s1 == s2;
    }
    Utilities.stringEquals = stringEquals;
    function getObjectKeys(obj) {
        var result = [];
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                result.push(name);
            }
        }
        return result;
    }
    Utilities.getObjectKeys = getObjectKeys;
})(Utilities || (Utilities = {}));
main();

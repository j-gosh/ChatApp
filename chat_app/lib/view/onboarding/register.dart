import 'package:chat_app/core/controllers/auth_controller.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

/// New-account registration form shown as a modal bottom sheet.
///
/// Collects first name, last name, email, and password. On success creates
/// a Firebase Auth user, Firestore profile, chat user, and video credentials,
/// then navigates to `/`.
class RegistrationPage extends ConsumerStatefulWidget {
  const RegistrationPage({super.key});
  @override
  ConsumerState<RegistrationPage> createState() => _RegistrationPageState();
}

class _RegistrationPageState extends ConsumerState<RegistrationPage> {
  // global key
  final formKey = GlobalKey<FormState>();
  //text fields
  final emailTextController = TextEditingController();
  final passwordTextController = TextEditingController();
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  // focus nodes
  final FocusNode emailFocus = FocusNode();
  final FocusNode passwordFocus = FocusNode();
  final FocusNode firstNameFocus = FocusNode();
  final FocusNode lastNameFocus = FocusNode();

  // error message
  late String errorMessage = '';

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    emailTextController.dispose();
    passwordTextController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
        child: SizedBox(
      height: MediaQuery.of(context).size.height * 0.80,
      width: double.infinity,
      child: Form(
        key: formKey,
        child: Column(
          children: [
            ListView(
              shrinkWrap: true,
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.only(top: 5.0, left: 14.0, right: 14.0),
              children: [
                const Padding(
                  padding: EdgeInsets.all(2.0),
                  child: Text(
                    'Register',
                    style: TextStyle(
                      fontSize: 36.0,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    errorMessage,
                    style: const TextStyle(fontSize: 14.0, color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: TextFormField(
                    validator: (value) {
                      if (value!.isEmpty) {
                        return 'Please enter your first name';
                      }
                      return null;
                    },
                    onTapOutside: (event) {
                      FocusManager.instance.primaryFocus!.unfocus();
                    },
                    controller: firstNameController,
                    keyboardType: TextInputType.name,
                    autofocus: true,
                    textInputAction: TextInputAction.next,
                    focusNode: firstNameFocus,
                    onFieldSubmitted: (term) {
                      FocusScope.of(context).requestFocus(lastNameFocus);
                    },
                    decoration: InputDecoration(
                      hintText: 'First Name',
                      contentPadding:
                          const EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(32.0),
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: TextFormField(
                    validator: (value) {
                      if (value!.isEmpty) {
                        return 'Please enter your last name.';
                      }
                      return null;
                    },
                    onTapOutside: (event) {
                      FocusManager.instance.primaryFocus!.unfocus();
                    },
                    controller: lastNameController,
                    keyboardType: TextInputType.name,
                    autofocus: true,
                    textInputAction: TextInputAction.next,
                    focusNode: lastNameFocus,
                    onFieldSubmitted: (term) {
                      FocusScope.of(context).requestFocus(emailFocus);
                    },
                    decoration: InputDecoration(
                      hintText: 'Last Name',
                      contentPadding:
                          const EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(32.0),
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: TextFormField(
                    validator: (value) {
                      if (value!.isEmpty) {
                        return 'Please enter a valid email.';
                      }
                      return null;
                    },
                    onTapOutside: (event) {
                      FocusManager.instance.primaryFocus!.unfocus();
                    },
                    controller: emailTextController,
                    keyboardType: TextInputType.emailAddress,
                    autofocus: true,
                    textInputAction: TextInputAction.next,
                    focusNode: emailFocus,
                    onFieldSubmitted: (term) {
                      FocusScope.of(context).requestFocus(passwordFocus);
                    },
                    decoration: InputDecoration(
                      hintText: 'Email',
                      contentPadding:
                          const EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(32.0),
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: TextFormField(
                    validator: (value) {
                      if (value!.length < 8) {
                        return 'Password must be longer than 8 characters.';
                      }
                      return null;
                    },
                    autofocus: false,
                    obscureText: true,
                    keyboardType: TextInputType.text,
                    controller: passwordTextController,
                    textInputAction: TextInputAction.next,
                    focusNode: passwordFocus,
                    onTapOutside: (event) {
                      FocusManager.instance.primaryFocus!.unfocus();
                    },
                    onFieldSubmitted: (term) {
                      FocusManager.instance.primaryFocus!.unfocus();
                    },
                    decoration: InputDecoration(
                      hintText: 'Password',
                      contentPadding:
                          const EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(32.0),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(top: 10.0),
              child: ElevatedButton(
                onPressed: () async {
                  if (formKey.currentState!.validate()) {
                    try {
                      final authController = ref.read(authControllerProvider);
                      await authController.signUp(
                        email: emailTextController.text,
                        password: passwordTextController.text,
                        firstName: firstNameController.text,
                        lastName: lastNameController.text,
                        userName: '${firstNameController.text}_${lastNameController.text}',
                      );
                      if (context.mounted) {
                        context.go('/');
                      }
                    } on FirebaseAuthException catch (error) {
                      setState(() {
                        errorMessage = error.code;
                      });
                    }
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color.fromARGB(255, 210, 217, 131),
                  fixedSize: const Size(250, 15),
                ),
                child: const Text('Sign Up',
                    style: TextStyle(color: Colors.black)),
              ),
            ),
            Padding(
              padding: EdgeInsets.zero,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  fixedSize: const Size(250, 15),
                ),
                onPressed: () {
                  context.pop();
                },
                child: const Text(
                  'Cancel',
                  style: TextStyle(color: Colors.black),
                ),
              ),
            )
          ],
        ),
      ),
    ));
  }
}

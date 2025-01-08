// @ts-nocheck
// Misleading error from TypeScript in method="POST" l:61
import type { QRL} from '@builder.io/qwik';
import { $, component$, useStylesScoped$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { InitialValues, SubmitHandler } from '@modular-forms/qwik';
import { formAction$, useForm, valiForm$ } from '@modular-forms/qwik';
import { email, type Input, minLength, object, string, boolean } from 'valibot';

import ImgBench from '~/media/bench.svg?jsx'


// Use valibot to create fields requeriments
const LoginSchema = object({
    email: string([
        minLength(1, 'Please enter your email.'),
        email('The email address is badly formatted.'),
    ]),
    password: string([
        minLength(1, 'Please enter your password.'),
        minLength(8, 'Your password must have 8 characters or more.'),
    ]),
    checkbox: boolean(),
});

// Define the structure and data types of the login fields, using LoginSchema
type LoginForm = Input<typeof LoginSchema>;


/* Set initial values
To do this, create a routeLoader$ and use as generic the previously created type. */
export const useFormLoader = routeLoader$<InitialValues<LoginForm>>(() => ({
    email: '',
    password: '',
    checkbox: false,
}));

// Handle submission, 
export const useFormAction = formAction$<LoginForm>((values) => {
    // Runs on Server 
    console.log(values);
}, valiForm$(LoginSchema));


export default component$(() => {
    useStylesScoped$(`
    .bigcontainer {
        min-height: 50%;
        width: 50%;
      }
      
      .bigcontainer>.row {
        min-height: 100%;
        width: 100%;
      }
      
      .bigcontainer input:focus,
      .bigcontainer input:checked,
      .bigcontainer input {
        border: none;
        border-bottom: 2px solid white;
        background-color: black;
        box-shadow: 0 0 0 2px transparent;
      }
      
      .bigcontainer input:hover {
        box-shadow: 0 0 0 1px none;
        border-bottom: 2px solid gray;
      }
      
      .bigcontainer .form-floating input:focus+label,
      .bigcontainer .form-floating input:not(:placeholder-shown)+label {
        visibility: hidden !important;
      }

      
      @media only screen and (max-width: 1000px) {
        .bigcontainer .card-img-top,
        .bigcontainer div.colimg  {
          position: absolute;
          display: none;
        }
      
        .bigcontainer div.colform {
          padding-top:  10%;
          padding-left: 10%;
          padding-right: 0%;
          padding-bottom: 25%;
        }
      
        .bigcontainer {
          min-height: 50%;
          width: 65%;
        } 
      }
  `);

    /* Create a form
    It returns the store of your form and an object with a Form, Field */
    const [loginForm, { Form, Field }] = useForm<LoginForm>({
        loader: useFormLoader(), // Load form with initial values
        action: useFormAction(), // Run function after form being submited
        validate: valiForm$(LoginSchema), // Valid input
    });

    console.log(loginForm); // Remove

    // Handle submission,  
    const handleSubmit: QRL<SubmitHandler<LoginForm>> = $((values: any, event: any) => {
        console.log(values)
        console.log(event)
    });

    return (
        <div class="container">
            <div class="card bigcontainer position-absolute top-50 start-50 translate-middle">
                <div class="row">
                    <div class="col colform d-flex justify-content-center m-auto">
                        <Form onSubmit$={handleSubmit} method="post" >
                            <div class="container">
                                <div class="text-center">
                                    <h3 class="primary-txt">Join your spot!</h3>
                                    <p class="text-body-secondary">It's good to have you back</p>

                                    <Field name="email">
                                        {(field, props) => (
                                            <div class="form-floating">
                                                <input {...props} type="email" value={field.value} class="form-control" id="floatingInput" autocomplete="off" placeholder="name@example.com" />
                                                <label for="floatingPassword">Email Address</label>
                                                {field.error && <div>{field.error}</div>}
                                            </div>
                                        )}
                                    </Field>

                                    <Field name="password">
                                        {(field, props) => (
                                            <div class="form-floating">
                                                <input {...props} type="password" value={field.value} class="form-control" id="floatingPassword" autocomplete="off" placeholder="Password" />
                                                <label for="floatingPassword"> Password </label>
                                                {field.error && <div>{field.error}</div>}
                                            </div>
                                        )}
                                    </Field>

                                    <Field name="checkbox" type="boolean">
                                        {(field, props) => (
                                            <div class="form-check text-start my-3">
                                                <input {...props} type="checkbox" value={field.value} class="form-check-input" id="flexCheckDefault" />
                                                <label class="form-check-label" for="flexCheckDefault">
                                                    Remember me
                                                </label>
                                            </div>
                                        )}
                                    </Field>
                                    <button class="btn btn-primary w-100 py-2" type="submit">Sign in</button>
                                    <a class="link-underline-dark" href="/register">Need an acconut?</a>
                                </div>
                            </div>
                        </Form>

                    </div>

                    <div class="col colimg d-flex justify-content-center">
                        <ImgBench/>
                    </div>
                </div>
            </div>
        </div>

    );
});
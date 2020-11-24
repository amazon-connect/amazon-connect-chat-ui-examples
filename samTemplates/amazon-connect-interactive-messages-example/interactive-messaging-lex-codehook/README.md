# Package structure of the Lambda function code hook for Amazon Connect Chat Interactive Messaging

* A handler method named handleRequest is defined in `app.js`. The handler method takes an event and context object as input and returns a response.
* All the application constants are kept in `constants/interactive_options.js` for easy reference.
* Inputs provided by the user are handleded in `util/user_input_handler.js`
* Responses with Interactive Message Templates are generated in `util/response_handler.js`

Amazon Connect chat currently supports the following Interactive Message Template types:
* Panel - A panel prompts the user to select an item. Items can include only text.
* List Picker - A list picker prompts the user to select an item. Items can include title, subtitle, and image. List Picker supports images at high level title as well as items while Panel does not.
* Time Picker - A time picker prompts the user to choose an available time slot, such as to schedule a meeting or appointment.

 
A structured response template for Interactive Messaging consists of the following elements:

```
templateType: the type of the template. valid values: Panel, ListPicker, TimePicker
version: the version of the template
data object: 
    title: title of the response card
    subtitle: subtitle of the response card
    imageType: the type of the image. Valid Value: URL
    imageData: url of the image.
    elements:
        title: title of the item
        subtitle: subtitle of the item
        imageType: the type of the image. Valid Value: URL
        imageData: url of the image.
    timeslots: 
        date: available date-time for a meeting or appointment. Valid Value can be any date, but it need to be specifically in the format shown in the exmaple below.
        duration: duration of the meeting or appointment
```

Here is an example of a `List Picker` template:

```
{
    "templateType":"ListPicker",
    "version":"1.0",
    "data":{
        "content":{
            "title":"Which department do you want to select?",
            "subtitle":"Tap to select option",
            "imageType":"URL",
            "imageData":"https://amazon-connect-interactive-message-blog-assets.s3-us-west-2.amazonaws.com/interactive-images/company.jpg",
            "elements":[
                {
                "title":"Billing",
                "subtitle":"Request billing information",
                "imageType":"URL",
                "imageData":"https://amazon-connect-interactive-message-blog-assets.s3-us-west-2.amazonaws.com/interactive-images/billing.jpg"
                },
                {
                "title":"New Service",
                "subtitle":"Set up a new service",
                "imageType":"URL",
                "imageData":"https://amazon-connect-interactive-message-blog-assets.s3-us-west-2.amazonaws.com/interactive-images/new_service.jpg"
                },
                {
                "title":"Cancellation",
                "subtitle":"Request a cancellation",
                "imageType":"URL",
                "imageData":"https://amazon-connect-interactive-message-blog-assets.s3-us-west-2.amazonaws.com/interactive-images/cancel.jpg"
                }
            ]
        }
    }
}
``` 
Here is an example of a `Time Picker` template:

```
{
    "templateType":"TimePicker",
    "version":"1.0",
    "data":{
        "content":{
            "title":"Schedule appointment",
            "subtitle":"Tap to select option",
            "timeslots":[
                {
                "date":"2020-10-31T18:00+00:00",
                "duration":60
                },
                {
                "date":"2020-10-15T13:00+00:00",
                "duration":60
                },
                {
                "date":"2020-10-15T16:00+00:00",
                "duration":60
                }
            ]
        }
    }
}
``` 
 
You can find additional information in the AWS Contact Center blog post [How to enable interactive messages in Amazon Connect chat](https://aws.amazon.com/blogs/contact-center/).
# Package structure of the Lambda function code hook for Amazon Connect Chat Interactive Messaging

* A handler method named handleRequest is defined in `app.js`. The handler method takes an event and context object as input and returns a response.
* All the application constants are kept in `constants/interactive_options.js` for easy reference.
* Inputs provided by the user are handleded in `util/user_input_handler.js`
* Responses with Interactive Message Templates are generated in `util/response_handler.js`

Amazon Connect chat currently supports the following Interactive Message Template types:
* Panel - A panel prompts the user to select an item. Items can include only text.
* List Picker - A list picker prompts the user to select an item. Items can include title, subtitle, and image. List Picker supports images at high level title as well as items while Panel does not.
* Time Picker - A time picker prompts the user to choose an available time slot, such as to schedule a meeting or appointment.
* QuickReply - A quick reply prompts the user with easy-to-click reply options. Items can include only text.
* Carousel - A horizontal scroll list of nested Panel or List Pickers templates

You can find additional information in the AWS Contact Center blog post [How to enable interactive messages in Amazon Connect chat](https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/).
 
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

```json
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

```json
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

Here is an example of a `Panel` template:

```json
{
  "templateType": "Panel",
  "version": "1.0",
  "data": {
    "content": {
      "title": "How can I help you?",
      "subtitle": "Tap to select option",
      "imageType": "URL",
      "imageData":
        "https://amazon-connect-interactive-message-blog-assets.s3-us-west-2.amazonaws.com/interactive-images/company.jpg",
      "elements": [
        {
          "title": "Check self-service options",
        },
        {
          "title": "Talk to an Agent",
        },
        {
          "title": "End chat",
        },
      ],
    },
  },
}
```

Here is an example of a `Time Picker` template:

```json
{
  "templateType": "Panel",
  "version": "1.0",
  "data": {
    "content": {
      "title": "How can I help you?",
      "subtitle": "Tap to select option",
      "imageType": "URL",
      "imageData":
        "https://amazon-connect-interactive-message-blog-assets.s3-us-west-2.amazonaws.com/interactive-images/company.jpg",
      "elements": [
        {
          "title": "Check self-service options",
        },
        {
          "title": "Talk to an Agent",
        },
        {
          "title": "End chat",
        },
      ],
    },
  },
}
```

Here is an example of a `QuickReply` template:

```json
{
  "templateType": "QuickReply",
  "version": "1.0",
  "data": {
      "content": {
        "title": "How was your experience?",
        "elements": [
            {
                "title": "Lorem ipsum"
            },
            {
                "title": "Lorem ipsum"
            },
            {
                "title": "Lorem ipsum dolor sit amet"
            },
            {
                "title": "Ipsum"
            }
        ]
      }
  }
}
```

Here is an example of a `Carousel` template:

```json
{
  "templateType": "Carousel",
  "version": "1.0",
  "data": {
    "content": {
      "title": "Select a destination:",
      "elements": [
        {
          "templateType": "ListPicker",
          "templateIdentifier": "8c0a55c8-1c37-41c2-b22a-62b2aaa7f1ac",
          "version": "1.0",
          "data": {
            "content": {
              "title": "Explore our travel options:",
              "subtitle": "Select an option:",
              "imageType": "URL",
              "imageData":
                "https://www.usnews.com/object/image/00000173-fe24-d76b-a773-fe3679d20000/200817-planesky-stock.jpg?update-time=1597696716591&size=responsive640",
              "elements": [
                {
                  "title": "Purchase Ticket",
                },
                {
                  "title": "View All Destinations",
                },
                {
                  "title": "Learn More",
                  "type": "hyperlink",
                  "url": "https://github.com/amazon-connect/amazon-connect-chat-interface",
                },
              ],
            },
          },
        },
        {
          "templateType": "ListPicker",
          "templateIdentifier": "2c0a55c8-3c37-41c2-b22a-62b2aaa7f1ac",
          "version": "1.0",
          "data": {
            "content": {
              "title": "Explore Hotel destinations",
              "subtitle": "Select an option:",
              "imageType": "URL",
              "imageData":
                "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/22/a1/9c/80/essentia-luxury-hotel.jpg?w=700&h=-1&s=1",
              "elements": [
                {
                  "title": "Book Room",
                },
                {
                  "title": "View All Listings",
                },
                {
                  "title": "Learn More",
                  "type": "hyperlink",
                  "url": "https://github.com/amazon-connect/amazon-connect-chat-interface",
                },
              ],
            },
          },
        },
        {
          "templateType": "ListPicker",
          "templateIdentifier": "3c0a55c8-3c37-41c2-b22a-62b2aaa7f1ac",
          "version": "1.0",
          "data": {
            "content": {
              "title": "Explore dining options",
              "subtitle": "Select an option:",
              "imageType": "URL",
              "imageData":
                "https://t3.ftcdn.net/jpg/02/27/62/24/360_F_227622470_sJ3yEaz44RK7UrWNaGdSn7azgeRu9UDs.jpg",
              "elements": [
                {
                  "title": "Book Table",
                },
                {
                  "title": "View Popular Entrees",
                },
                {
                  "title": "Learn More",
                  "type": "hyperlink",
                  "url": "https://github.com/amazon-connect/amazon-connect-chat-interface",
                },
              ],
            },
          },
        },
        {
          "templateType": "ListPicker",
          "templateIdentifier": "4c0a55c8-3c37-41c2-b22a-62b2aaa7f1ac",
          "version": "1.0",
          "data": {
            "content": {
              "title": "Explore our travel options:",
              "subtitle": "Select an option:",
              "imageType": "URL",
              "imageData":
                "https://media.istockphoto.com/photos/young-woman-pulling-suitcase-in-airport-terminal-copy-space-picture-id1173736603?b=1&k=20&m=1173736603&s=612x612&w=0&h=1V_XBSWHppXzMQIzkyG6drqgrEl_prEogWXjbN7Gxwo=",
              "elements": [
                {
                  "title": "Purchase Ticket",
                },
                {
                  "title": "View All Destinations",
                },
                {
                  "title": "Learn More",
                  "type": "hyperlink",
                  "url": "https://github.com/amazon-connect/amazon-connect-chat-interface",
                },
              ],
            },
          },
        },
        {
          "templateType": "ListPicker",
          "templateIdentifier": "6c0a55c8-3c37-41c2-b22a-62b2aaa7f1ac",
          "version": "1.0",
          "data": {
            "content": {
              "title": "Hotel Gabonzo Suite",
              "subtitle": "Select an option:",
              "imageType": "URL",
              "imageData":
                "https://media.istockphoto.com/id/929135598/photo/santorini-greece-picturesq-view-of-traditional-cycladic-santorini-houses-on-small-street-with.jpg?s=612x612&w=0&k=20&c=Z8R8IPtjYfk8gc5Q-1Q4jD1coUgqu5vuTezM2ONRUPA=",
              "elements": [
                {
                  "title": "Book Tour",
                },
                {
                  "title": "View Ratings",
                },
                {
                  "title": "Open Gallery",
                  "type": "hyperlink",
                  "url": "https://github.com/amazon-connect/amazon-connect-chat-interface",
                },
              ],
            },
          },
        },
      ],
    },
  },
}
```
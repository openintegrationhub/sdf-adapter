The Smart Data Framework Adapter (SDF-Adapter) allows flows to communicate with the smart data framework. It is responsible for forwarding the incoming events to the smart data framework. Furthermore, it is responsbile for increasing the ease of use for connector developers as it masks service endpoints.

## Entrypoint

The SDF-Adpater is triggered by incoming events received from either the preceding adapter or the transformer (depending on oih operator configuration).

## Message Processing

If a message arrives from the preceding component it is forwared to the correct service(s)/queue(s). One possible recipient of the forwarded message is the [dispatcher component](component-dispatcher.md).

![sdfAdapter](assets/sdfAdapter.png)

If scenario 1 is realized it is necessary that the sdf adapter provides meta information in order to clearly identify the data set after it has been pushed onto the queue.

The following snippet shows an example of a dataset that has been processed by the sdf adapter:

```json
{
    "meta":{
        "domainId":"123",
        "schemaUri":"/collaboration/task.json",
        "recordUid":"456",
        "applicationUid":"ab1",
        "iamToken":"ddfdsfsdf5-sdfsdfsdfsdf6",
    },
    "data":{
        "oihUid": "567",
        "oihApplicationRecords": [
        {
          "applicationUid": "123",
          "recordUid": "201306",
        },
        ],
        "substasks": [
        {
            "task": "Analyze system 1",
            "details": {
                "subject": "analysis",
                "startdate": "2018-01-01T10:10:10Z",
                "enddate": "2018-03-01T10:10:10Z",
                "reminderdate": "2018-02-01T10:10:10Z",
                "content": "To create a datamodel we have to analyze system 1...",
                "status": "in progress",
            },
        },
        {
            "task": "Analyze system 2",
            "details": {
                "subject": "analysis",
                "startdate": "2018-01-01T10:10:10Z",
                "enddate": "2018-03-01T10:10:10Z",
                "reminderdate": "2018-02-01T10:10:10Z",
                "content": "To create a datamodel we have to analyze system 2...",
                "status": "in progress",
            },
        },
      ],
        "details": {
            "task": "Analyze systems",
            "details": {
                "subject": "analysis",
                "startdate": "2018-01-01T10:10:10Z",
                "enddate": "2018-03-01T10:10:10Z",
                "reminderdate": "2018-02-01T10:10:10Z",
                "content": "To create a datamodel we have to analyze system 1...",
                "status": "in progress",
            },
        },
    },
}
```

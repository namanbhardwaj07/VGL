/**
* Description of the module and the logic it provides
*
* @module cartridge/scripts/steps/deletefeed
*/

'use strict';

var File = require('dw/io/File');
var WebDAVClient = require('dw/net/WebDAVClient');
var ArrayList = require('dw/util/ArrayList');
var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');
var SortedSet = require('dw/util/SortedSet');

var logger = Logger.getLogger("webdavsteps","simplefeeds");

function execute(params, stepExecution) {
	var jobExecution = stepExecution.getJobExecution();
    // read parameters
	var remoteFolderURL = params.RemoteFolderPath;
 	var remoteLogin = params.RemoteLogin;
 	var remotePassword = params.RemotePassword;
 	var remoteFile = jobExecution.context.RemoteFile;

    // check parameters
    if ( empty( remoteFolderURL ) )
    {
    	logger.error( "DeleteFeed: Parameter RemoteFolderURL empty" );
    	return new Status(Status.ERROR,"INPUT_MISSING","DownloadFeed: Parameter RemoteFolderURL empty");
    }

    if ( empty( remoteFile ) )
    {
    	logger.error( "DeleteFeed: Parameter RemoteFile empty" );
    	return new Status(Status.ERROR,"REMOTE_FILE_MISSING","DownloadFeed: Remote File is not available");
    }

    logger.debug( "DeleteFeed: " +
    	"RemoteFolderURL: " + remoteFolderURL + ", " +
    	"RemoteFile: " + remoteFile + ", " +
    	"RemoteLogin: " + ( !empty( remoteLogin ) ? remoteLogin : "(empty)" ) + ", " +
    	"RemotePassword: " + ( !empty( remotePassword ) ? "(provided)" : "(empty)" ) );

	var result;

	if ( remoteFolderURL.indexOf( "sftp://" ) == 0 )
	{
		result = deleteRemoteFileSFTP( remoteFolderURL, remoteFile, remoteLogin, remotePassword );
	}
	else
	{
		result = deleteRemoteFileWebDAV( remoteFolderURL, remoteFile, remoteLogin, remotePassword );
	}
	
	if ( !result )
	{
		return new Status(Status.ERROR,"DELETE_ERROR","Error while deleting file");
	}
	
	return new Status(Status.OK,"DELETE_SUCCESSFUL","The delete was successful");

}

function deleteRemoteFileWebDAV( remoteFolderURL, remoteFile, remoteLogin, remotePassword )
{	
	var webDAVClient;
	
	if ( !empty( remoteLogin ) && !empty( remotePassword ) )
	{
		// use authentication
		webDAVClient = new WebDAVClient( remoteFolderURL, remoteLogin, remotePassword );
	}
	else
	{
		// no authentication
		webDAVClient = new WebDAVClient( remoteFolderURL );
	}

	try
	{
		webDAVClient.del( remoteFile );
	}
	catch ( ex )
	{
		logger.error( "DeleteFeed: Error while deleting " + remoteFolderURL + remoteFile + ": " + ex );		
		return false;
	}

	if ( !webDAVClient.succeeded() )
	{
		logger.error( "DeleteFeed: Error while deleting " + remoteFolderURL + remoteFile + ": " +
			webDAVClient.statusCode + " " + webDAVClient.statusText );		
		return false;
	}
	
	webDAVClient.close();
	
    return true;
}


exports.webdavDelete = function( parameters, stepExecution )
{
  try
  {
    execute(parameters, stepExecution );
  }
  catch(ex)
  {
    logger.error( "DeleteFeed:" + ex);
    return new Status(Status.ERROR, null, ex);
  }
} 

/**
* Description of the module and the logic it provides
*
* @module cartridge/scripts/steps/downloadfeed
*/
'use strict';

var File = require('dw/io/File');
var WebDAVClient = require('dw/net/WebDAVClient');
var ArrayList = require('dw/util/ArrayList');
var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');
var SortedSet = require('dw/util/SortedSet');

var logger = Logger.getLogger("webdavsteps","simplefeeds");

function execute( args, stepExecution )
{
	// read parameters
	var jobExecution = stepExecution.getJobExecution();
	var remoteFolderURL = args.RemoteFolderPath;
 	var remoteLogin = args.RemoteLogin;
 	var remotePassword = args.RemotePassword;
    var remoteFilePattern = args.RemoteFilePattern;
    var tempFolder = args.TempFolder;

    // check parameters
    if ( empty(remoteFolderURL) )
    {
    	logger.error( "DownloadFeed: Parameter RemoteFolderURL empty" );
    	return new Status(Status.ERROR,"INPUT_MISSING","DownloadFeed: Parameter RemoteFolderURL empty");
    }

    if ( empty(remoteFilePattern) )
    {
    	logger.error( "DownloadFeed: Parameter RemoteFilePattern empty" );
    	return new Status(Status.ERROR,"INPUT_MISSING","DownloadFeed: Parameter RemoteFilePattern empty");
    }

    if ( empty(tempFolder) )
    {
    	logger.error( "DownloadFeed: Parameter TempFolder empty" );
    	return new Status(Status.ERROR,"INPUT_MISSING","DownloadFeed: Parameter TempFolder empty");
    }

    logger.debug( "DownloadFeed: " +
    	"RemoteFolderURL: " + remoteFolderURL + ", " +
    	"RemoteLogin: " + ( !empty( remoteLogin ) ? remoteLogin : "(empty)" ) + ", " +
    	"RemotePassword: " + ( !empty( remotePassword ) ? "(provided)" : "(empty)" ) + ", " +
    	"RemoteFilePattern: " + remoteFilePattern + ", " +
    	"TempFolder: " + tempFolder );

    // get list of all files in folder
	var remoteFiles = listRemoteFiles( remoteFolderURL, remoteLogin, remotePassword );
	if ( remoteFiles == null )
	{
		// there was a technical problem
		return new Status(Status.OK,"FILE_NOT_FOUND","The file could not be found.");
	}
	
	// filter list
	remoteFiles = filterRemoteFiles( remoteFiles, remoteFilePattern );
	
	// sort list
	remoteFiles = new SortedSet( remoteFiles );
	
	if ( remoteFiles.empty )
	{
		// no more files to process
		return new Status(Status.OK,"NO_MORE_FILES","No more files to process");
	}

	// pick the first file from the collection
	var remoteFile = remoteFiles[0];
	jobExecution.context.RemoteFile = remoteFile;
	
	logger.debug( "DownloadFeed: Downloading " + remoteFile );

	if ( !createTempFolder( tempFolder ) )
	{
		// couldn't create folder
		return new Status(Status.ERROR,"FOLDER_CREATION_ERROR","DownloadFeed: Couldn't create a temp folder");
	}

	var file = tempFolder + File.SEPARATOR + remoteFile;
	
	if ( !downloadFile( remoteFolderURL, remoteLogin, remotePassword, remoteFile, file ) )
	{
		// error downloading file
		return new Status(Status.ERROR,"DOWNLOAD_ERROR","Error while downloading file");
	}

	return new Status(Status.OK,"DOWNLOAD_SUCCESSFUL","The download was successful");

}

function listRemoteFiles( remoteFolderURL, remoteLogin, remotePassword )
{
	if ( remoteFolderURL.indexOf( "sftp://" ) == 0 )
	{
		return listRemoteFilesSFTP( remoteFolderURL, remoteLogin, remotePassword );
	}
	else
	{
		return listRemoteFilesWebDAV( remoteFolderURL, remoteLogin, remotePassword );
	}
}

function listRemoteFilesWebDAV( remoteFolderURL, remoteLogin, remotePassword )
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

	var files;
	
	try
	{
		// remoteFolderURL already contains full reference to folder, no path to append, we pass ""
		// The default depth of 1 makes propfind return the current folder AND files in that folder.
		files = webDAVClient.propfind( "" );
	}
	catch ( ex )
	{
		logger.error( "DownloadFeed: Error while listing " + remoteFolderURL + ": " + ex );		
		return null;
	}
	
	if ( !webDAVClient.succeeded() )
	{
		logger.error( "DownloadFeed: Error while listing " + remoteFolderURL + ": " +
			webDAVClient.statusCode + " " + webDAVClient.statusText );		
		return null;
	}

	webDAVClient.close();

	var remoteFiles = new ArrayList();
	
	for each ( var file in files )
	{
		// filter out directories; this will automatically remove the current folder from the list
		if ( !file.directory )
		{
			logger.debug( "DownloadFeed: Listing file: " + file.name );
			remoteFiles.add( file.name );
		}		
	}
	
	return remoteFiles;
}

function filterRemoteFiles( remoteFiles, remoteFilePattern )
{
	var regExp = new RegExp( remoteFilePattern );

	var filteredRemoteFiles = new ArrayList();
	
	for each ( var remoteFile in remoteFiles )
	{
		if ( regExp.test( remoteFile ) )
		{
			logger.debug( "DownloadFeed: Matching file: " + remoteFile );
			filteredRemoteFiles.add( remoteFile );
		}
	}
	
	return filteredRemoteFiles;
}

function createTempFolder( tempFolder )
{
	var folder = new File( File.IMPEX + File.SEPARATOR + "src" + File.SEPARATOR + tempFolder );

	if ( folder.exists() )
	{
		// nothing to do
		return true;
	}

	logger.debug( "DownloadFeed: Creating temp folder " + folder.fullPath );

	// create folder	
	var result = folder.mkdirs();
	if ( !result )
	{
		logger.error( "DownloadFeed: Error creating temp folder " + folder.fullPath );
		return false;
	}
	
	return true;
}

function downloadFile( remoteFolderURL, remoteLogin, remotePassword, remoteFile, file )
{
	if ( remoteFolderURL.indexOf( "sftp://" ) == 0 )
	{
		return downloadFileSFTP( remoteFolderURL, remoteLogin, remotePassword, remoteFile, file );
	}
	else
	{
		return downloadFileWebDAV( remoteFolderURL, remoteLogin, remotePassword, remoteFile, file );
	}
}

function downloadFileWebDAV( remoteFolderURL, remoteLogin, remotePassword, remoteFile, file )
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

	var files;
	
	// figure size of remote file
	try
	{
		files = webDAVClient.propfind( remoteFile );
	}
	catch ( ex )
	{
		logger.error( "DownloadFeed: Error while listing " + remoteFolderURL + remoteFile + ": " + ex );		
		return false;
	}

	if ( !webDAVClient.succeeded() )
	{
		logger.error( "DownloadFeed: Error while listing " + remoteFolderURL + remoteFile + ": " +
			webDAVClient.statusCode + " " + webDAVClient.statusText );		
		return false;
	}

	if ( files.length != 1 )
	{
		logger.error( "DownloadFeed: Unexpected number of elements when listing " + remoteFolderURL + remoteFile + ": " + files.length );		
		webDAVClient.close();
		return false;
	}

	var fileSize = files[0].size;

	// file too large?	
	if ( fileSize > WebDAVClient.MAX_GET_FILE_SIZE )
	{
		logger.error( "DownloadFeed: File " + remoteFolderURL + remoteFile + " too large to download: " +
			"file size: " + fileSize + ", MAX_GET_FILE_SIZE: " + WebDAVClient.MAX_GET_FILE_SIZE );		
		webDAVClient.close();
		return false;
	}

	logger.debug( "DownloadFeed: File size: " + fileSize );

	// download file
	var localFile = new File( File.IMPEX + File.SEPARATOR + "src" + File.SEPARATOR + file );

	try
	{
		webDAVClient.getBinary( remoteFile, localFile, WebDAVClient.MAX_GET_FILE_SIZE );
	}
	catch ( ex )
	{
		logger.error( "DownloadFeed: Error while downloading " + remoteFolderURL + remoteFile + " to " + localFile.fullPath + ": " + ex );		
		return false;
	}
	
	if ( !webDAVClient.succeeded() )
	{
		logger.error( "DownloadFeed: Error while downloading " + remoteFolderURL + remoteFile + " to " + localFile.fullPath + ": " +
			webDAVClient.statusCode + " " + webDAVClient.statusText );		
		return false;
	}

	webDAVClient.close();

	// compare file sizes
	var localFileSize = localFile.length();
	
	if ( fileSize != localFileSize )
	{
		logger.error( "DownloadFeed: Remote and local file sizes differ after download: " +
			"remote: " + fileSize + ", local: " + localFileSize );		
		return false;
	}

	// downloaded successfully
	return true;
}


exports.webdavDownload = function( parameters, stepExecution )
{
  try
  {
    execute(parameters, stepExecution );
  }
  catch(ex)
  {
    logger.error( "DownloadFeed:" + ex);
    return new Status(Status.ERROR, null, ex);
  }
} 

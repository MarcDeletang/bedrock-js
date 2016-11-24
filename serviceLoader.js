module.exports = {

	load(services){
		for (var serviceName in services){
			if (global[serviceName] != undefined)
				Bedrock.log.warn('Service ' + serviceName + ' not loaded (already defined in global namespace)')
			else{
				global[serviceName] = services[serviceName]
				if (Bedrock.verbose){
					Bedrock.log.info('Service ' + serviceName + ' loaded')
				}
			}
		}
	}
}